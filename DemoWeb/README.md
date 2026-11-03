# DemoBoard

Next.js · shadcn/ui · TypeScript로 만든 웹 게시판입니다.

## 실행

1. `.env.example`을 `.env.local`로 복사하고 Neon 연결 문자열을 `DATABASE_URL`에 넣습니다.
2. 의존성 설치, 테이블 생성(처음 한 번), 개발 서버 실행:

```bash
npm install
npm run db:setup
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 기능

- 게시글 목록 (공지 상단 고정, 분류 필터, 검색, 페이지네이션)
- 글쓰기 / 수정 / 삭제 (작성 시 입력한 비밀번호로 수정·삭제)
- 댓글, 조회수

## 구조

- `src/app` — 페이지(`/`, `/posts/new`, `/posts/[id]`, `/posts/[id]/edit`)와 Server Actions(`actions.ts`)
- `src/lib/db.ts`, `src/lib/posts.ts` — Neon(PostgreSQL) 연결과 게시글·댓글 쿼리
- `scripts/setup-db.mjs` — `posts`, `comments` 테이블 생성 및 샘플 데이터 입력 (샘플 비밀번호: `1234`)
- `src/components` — 폼, 삭제 다이얼로그 등 UI 컴포넌트 (`ui/`는 shadcn/ui)
