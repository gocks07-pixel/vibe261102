// 테이블을 만들고, 게시글이 하나도 없으면 샘플 데이터를 넣는다.
// 실행: npm run db:setup  (.env.local의 DATABASE_URL 사용)
import { randomBytes, scryptSync } from "node:crypto"

import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

// src/lib/posts.ts의 hashPassword와 같은 형식 (salt:hash)
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 32).toString("hex")
  return `${salt}:${hash}`
}

await sql`
  CREATE TABLE IF NOT EXISTS posts (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(100) NOT NULL,
    content       TEXT NOT NULL,
    author        VARCHAR(20) NOT NULL,
    category      VARCHAR(10) NOT NULL,
    views         INTEGER NOT NULL DEFAULT 0,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS comments (
    id         SERIAL PRIMARY KEY,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author     VARCHAR(20) NOT NULL,
    content    VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`
await sql`CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments (post_id)`
console.log("✓ 테이블 준비 완료")

const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`
if (count > 0) {
  console.log(`게시글 ${count}개가 이미 있어 샘플 데이터는 건너뜁니다.`)
  process.exit(0)
}

const samples = [
  ["공지", "DemoBoard에 오신 것을 환영합니다", "관리자", "Next.js, shadcn/ui, TypeScript로 만든 데모 게시판입니다.\n\n샘플 게시글의 비밀번호는 모두 1234 입니다.", 40],
  ["자유", "오늘 날씨가 정말 좋네요", "홍길동", "점심 먹고 산책하기 딱 좋은 날씨입니다. 다들 즐거운 하루 보내세요!", 33],
  ["질문", "Server Action에서 redirect는 어떻게 쓰나요?", "김개발", "폼 제출 후 상세 페이지로 이동시키고 싶은데, redirect를 try/catch 안에서 호출하면 동작하지 않네요.", 26],
  ["정보", "shadcn/ui 컴포넌트 추가 방법", "이디자인", "npx shadcn@latest add button 처럼 필요한 컴포넌트만 골라서 추가할 수 있습니다.", 19],
  ["자유", "주말 계획 공유해요", "박주말", "이번 주말에는 캠핑을 가려고 합니다. 다른 분들은 어떤 계획이 있으신가요?", 12],
]
const passwordHash = hashPassword("1234")

const ids = []
for (const [i, [category, title, author, content, views]] of samples.entries()) {
  const daysAgo = samples.length - i
  const [row] = await sql`
    INSERT INTO posts (title, content, author, category, views, password_hash, created_at, updated_at)
    VALUES (${title}, ${content}, ${author}, ${category}, ${views}, ${passwordHash},
            now() - make_interval(days => ${daysAgo}), now() - make_interval(days => ${daysAgo}))
    RETURNING id
  `
  ids.push(row.id)
}
await sql`
  INSERT INTO comments (post_id, author, content, created_at)
  VALUES (${ids[2]}, '이선배', 'redirect는 내부적으로 예외를 던지기 때문에 try/catch 밖에서 호출해야 합니다.', now() - interval '12 hours')
`
console.log(`✓ 샘플 게시글 ${ids.length}개 추가`)
