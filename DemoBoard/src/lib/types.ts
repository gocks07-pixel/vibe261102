export const CATEGORIES = ["공지", "자유", "질문", "정보"] as const

export type Category = (typeof CATEGORIES)[number]

export interface Comment {
  id: number
  author: string
  content: string
  createdAt: string
}

export interface Post {
  id: number
  title: string
  content: string
  author: string
  category: Category
  views: number
  passwordHash: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

/** 클라이언트로 내려보내도 되는 게시글 형태 (비밀번호 해시 제외) */
export type PublicPost = Omit<Post, "passwordHash">

export type FormState = {
  ok?: boolean
  message?: string
  errors?: Partial<Record<string, string>>
  /** 검증 실패 시 입력값을 되돌려 주어 폼 초기화 후에도 유지되게 한다 */
  values?: Partial<Record<string, string>>
}
