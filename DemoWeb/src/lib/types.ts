export const CATEGORIES = ["공지", "자유", "질문", "정보"] as const

export type Category = (typeof CATEGORIES)[number]

export interface Comment {
  id: number
  author: string
  content: string
  createdAt: string
}

/** 목록에 쓰는 게시글 요약 */
export interface PostSummary {
  id: number
  title: string
  author: string
  category: Category
  views: number
  createdAt: string
  updatedAt: string
  commentCount: number
}

/** 상세 화면용 게시글 (비밀번호 해시는 서버 밖으로 내보내지 않는다) */
export interface PublicPost extends PostSummary {
  content: string
  comments: Comment[]
}

export type FormState = {
  ok?: boolean
  message?: string
  errors?: Partial<Record<string, string>>
  /** 검증 실패 시 입력값을 되돌려 주어 폼 초기화 후에도 유지되게 한다 */
  values?: Partial<Record<string, string>>
}
