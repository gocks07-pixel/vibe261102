import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { Category, Comment, Post, PublicPost } from "@/lib/types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "posts.json")

export const PAGE_SIZE = 10

interface Store {
  nextPostId: number
  nextCommentId: number
  posts: Post[]
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 32).toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  const expected = Buffer.from(hash, "hex")
  const actual = scryptSync(password, salt, expected.length)
  return timingSafeEqual(expected, actual)
}

function seed(): Store {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const samples: Array<[Category, string, string, string]> = [
    ["공지", "DemoBoard에 오신 것을 환영합니다", "관리자", "Next.js, shadcn/ui, TypeScript로 만든 데모 게시판입니다.\n\n샘플 게시글의 비밀번호는 모두 1234 입니다."],
    ["자유", "오늘 날씨가 정말 좋네요", "홍길동", "점심 먹고 산책하기 딱 좋은 날씨입니다. 다들 즐거운 하루 보내세요!"],
    ["질문", "Server Action에서 redirect는 어떻게 쓰나요?", "김개발", "폼 제출 후 상세 페이지로 이동시키고 싶은데, redirect를 try/catch 안에서 호출하면 동작하지 않네요."],
    ["정보", "shadcn/ui 컴포넌트 추가 방법", "이디자인", "npx shadcn@latest add button 처럼 필요한 컴포넌트만 골라서 추가할 수 있습니다."],
    ["자유", "주말 계획 공유해요", "박주말", "이번 주말에는 캠핑을 가려고 합니다. 다른 분들은 어떤 계획이 있으신가요?"],
  ]
  const passwordHash = hashPassword("1234")
  const posts: Post[] = samples.map(([category, title, author, content], i) => {
    const createdAt = new Date(now - (samples.length - i) * day).toISOString()
    return {
      id: i + 1,
      title,
      content,
      author,
      category,
      views: Math.max(0, 40 - i * 7),
      passwordHash,
      createdAt,
      updatedAt: createdAt,
      comments: [],
    }
  })
  posts[2].comments.push({
    id: 1,
    author: "이선배",
    content: "redirect는 내부적으로 예외를 던지기 때문에 try/catch 밖에서 호출해야 합니다.",
    createdAt: new Date(now - day / 2).toISOString(),
  })
  return { nextPostId: posts.length + 1, nextCommentId: 2, posts }
}

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8")) as Store
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
    const store = seed()
    await save(store)
    return store
  }
}

async function save(store: Store) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8")
}

// 동시 요청에서 쓰기가 겹치지 않도록 변경 작업을 순서대로 실행한다.
let queue: Promise<unknown> = Promise.resolve()
function mutate<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const store = await load()
    const result = await fn(store)
    await save(store)
    return result
  })
  queue = run.catch(() => {})
  return run
}

function toPublic(post: Post): PublicPost {
  const { passwordHash, ...rest } = post
  void passwordHash
  return rest
}

export async function listPosts({
  q = "",
  category,
  page = 1,
}: {
  q?: string
  category?: Category
  page?: number
}) {
  const { posts } = await load()
  const keyword = q.trim().toLowerCase()
  const filtered = posts
    .filter((p) => !category || p.category === category)
    .filter(
      (p) =>
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.content.toLowerCase().includes(keyword) ||
        p.author.toLowerCase().includes(keyword)
    )
    .sort((a, b) => {
      // 공지는 항상 위에 고정
      if (a.category === "공지" && b.category !== "공지") return -1
      if (b.category === "공지" && a.category !== "공지") return 1
      return b.id - a.id
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(Math.max(1, page), totalPages)
  return {
    posts: filtered
      .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
      .map(toPublic),
    total: filtered.length,
    page: current,
    totalPages,
  }
}

export async function getPost(id: number): Promise<PublicPost | null> {
  const { posts } = await load()
  const post = posts.find((p) => p.id === id)
  return post ? toPublic(post) : null
}

export function createPost(input: {
  title: string
  content: string
  author: string
  category: Category
  password: string
}): Promise<number> {
  return mutate((store) => {
    const now = new Date().toISOString()
    const id = store.nextPostId++
    store.posts.push({
      id,
      title: input.title,
      content: input.content,
      author: input.author,
      category: input.category,
      views: 0,
      passwordHash: hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
      comments: [],
    })
    return id
  })
}

type AuthResult = "ok" | "not-found" | "wrong-password"

export function updatePost(
  id: number,
  input: { title: string; content: string; category: Category; password: string }
): Promise<AuthResult> {
  return mutate((store) => {
    const post = store.posts.find((p) => p.id === id)
    if (!post) return "not-found"
    if (!verifyPassword(input.password, post.passwordHash)) return "wrong-password"
    post.title = input.title
    post.content = input.content
    post.category = input.category
    post.updatedAt = new Date().toISOString()
    return "ok"
  })
}

export function deletePost(id: number, password: string): Promise<AuthResult> {
  return mutate((store) => {
    const index = store.posts.findIndex((p) => p.id === id)
    if (index === -1) return "not-found"
    if (!verifyPassword(password, store.posts[index].passwordHash)) return "wrong-password"
    store.posts.splice(index, 1)
    return "ok"
  })
}

export function incrementViews(id: number): Promise<void> {
  return mutate((store) => {
    const post = store.posts.find((p) => p.id === id)
    if (post) post.views++
  })
}

export function addComment(
  postId: number,
  input: { author: string; content: string }
): Promise<Comment | null> {
  return mutate((store) => {
    const post = store.posts.find((p) => p.id === postId)
    if (!post) return null
    const comment: Comment = {
      id: store.nextCommentId++,
      author: input.author,
      content: input.content,
      createdAt: new Date().toISOString(),
    }
    post.comments.push(comment)
    return comment
  })
}
