import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

import { sql } from "@/lib/db"
import type { Category, Comment, PostSummary, PublicPost } from "@/lib/types"

export const PAGE_SIZE = 10

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

type Row = Record<string, unknown>

const iso = (value: unknown) => new Date(value as string | Date).toISOString()

function toSummary(row: Row): PostSummary {
  return {
    id: row.id as number,
    title: row.title as string,
    author: row.author as string,
    category: row.category as Category,
    views: row.views as number,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    commentCount: Number(row.comment_count ?? 0),
  }
}

function toComment(row: Row): Comment {
  return {
    id: row.id as number,
    author: row.author as string,
    content: row.content as string,
    createdAt: iso(row.created_at),
  }
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
  const keyword = q.trim()
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`
  const cat = category ?? null

  const [{ total }] = await sql`
    SELECT count(*)::int AS total FROM posts
    WHERE (${cat}::text IS NULL OR category = ${cat})
      AND (${keyword} = '' OR title ILIKE ${pattern} OR content ILIKE ${pattern} OR author ILIKE ${pattern})
  `
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(Math.max(1, page), totalPages)

  // 공지는 항상 위에 고정
  const rows = await sql`
    SELECT p.id, p.title, p.author, p.category, p.views, p.created_at, p.updated_at,
           (SELECT count(*) FROM comments c WHERE c.post_id = p.id)::int AS comment_count
    FROM posts p
    WHERE (${cat}::text IS NULL OR p.category = ${cat})
      AND (${keyword} = '' OR p.title ILIKE ${pattern} OR p.content ILIKE ${pattern} OR p.author ILIKE ${pattern})
    ORDER BY (p.category = '공지') DESC, p.id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${(current - 1) * PAGE_SIZE}
  `
  return { posts: rows.map(toSummary), total: total as number, page: current, totalPages }
}

export async function getPost(id: number): Promise<PublicPost | null> {
  if (!Number.isInteger(id)) return null
  const [rows, comments] = await sql.transaction([
    sql`SELECT id, title, content, author, category, views, created_at, updated_at FROM posts WHERE id = ${id}`,
    sql`SELECT id, author, content, created_at FROM comments WHERE post_id = ${id} ORDER BY id`,
  ])
  const row = rows[0]
  if (!row) return null
  return {
    ...toSummary(row),
    content: row.content as string,
    comments: comments.map(toComment),
  }
}

export async function createPost(input: {
  title: string
  content: string
  author: string
  category: Category
  password: string
}): Promise<number> {
  const [row] = await sql`
    INSERT INTO posts (title, content, author, category, password_hash)
    VALUES (${input.title}, ${input.content}, ${input.author}, ${input.category}, ${hashPassword(input.password)})
    RETURNING id
  `
  return row.id as number
}

type AuthResult = "ok" | "not-found" | "wrong-password"

async function checkPassword(id: number, password: string): Promise<AuthResult> {
  const [row] = await sql`SELECT password_hash FROM posts WHERE id = ${id}`
  if (!row) return "not-found"
  return verifyPassword(password, row.password_hash as string) ? "ok" : "wrong-password"
}

export async function updatePost(
  id: number,
  input: { title: string; content: string; category: Category; password: string }
): Promise<AuthResult> {
  const result = await checkPassword(id, input.password)
  if (result !== "ok") return result
  await sql`
    UPDATE posts
    SET title = ${input.title}, content = ${input.content}, category = ${input.category}, updated_at = now()
    WHERE id = ${id}
  `
  return "ok"
}

export async function deletePost(id: number, password: string): Promise<AuthResult> {
  const result = await checkPassword(id, password)
  if (result !== "ok") return result
  // 댓글은 ON DELETE CASCADE로 함께 삭제된다
  await sql`DELETE FROM posts WHERE id = ${id}`
  return "ok"
}

export async function incrementViews(id: number): Promise<void> {
  await sql`UPDATE posts SET views = views + 1 WHERE id = ${id}`
}

export async function addComment(
  postId: number,
  input: { author: string; content: string }
): Promise<Comment | null> {
  const [row] = await sql`
    INSERT INTO comments (post_id, author, content)
    SELECT id, ${input.author}, ${input.content} FROM posts WHERE id = ${postId}
    RETURNING id, author, content, created_at
  `
  return row ? toComment(row) : null
}
