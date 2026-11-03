import "server-only"

import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.")
}

/** Neon(PostgreSQL) HTTP 클라이언트. 태그드 템플릿 값은 자동으로 파라미터 바인딩된다. */
export const sql = neon(process.env.DATABASE_URL)
