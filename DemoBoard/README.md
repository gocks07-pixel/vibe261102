# DemoBoard

Next.js · shadcn/ui · TypeScript로 만든 웹 게시판입니다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 기능

- 게시글 목록 (공지 상단 고정, 분류 필터, 검색, 페이지네이션)
- 글쓰기 / 수정 / 삭제 (작성 시 입력한 비밀번호로 수정·삭제)
- 댓글, 조회수

## 구조

- `src/app` — 페이지(`/`, `/posts/new`, `/posts/[id]`, `/posts/[id]/edit`)와 Server Actions(`actions.ts`)
- `src/lib/posts.ts` — 데이터 저장소. `data/posts.json` 파일에 저장하며, 파일이 없으면 샘플 데이터로 자동 생성됩니다 (샘플 비밀번호: `1234`).
- `src/components` — 폼, 삭제 다이얼로그 등 UI 컴포넌트 (`ui/`는 shadcn/ui)
