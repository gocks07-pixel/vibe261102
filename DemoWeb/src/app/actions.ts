"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  addComment,
  createPost,
  deletePost,
  incrementViews,
  updatePost,
} from "@/lib/posts"
import { CATEGORIES, type Category, type FormState } from "@/lib/types"

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function validatePost(formData: FormData, requireAuthor: boolean) {
  const values = {
    title: text(formData, "title"),
    content: text(formData, "content"),
    author: text(formData, "author"),
    category: text(formData, "category") as Category,
    password: text(formData, "password"),
  }
  const errors: Record<string, string> = {}
  if (!values.title) errors.title = "제목을 입력해 주세요."
  else if (values.title.length > 100) errors.title = "제목은 100자 이내로 입력해 주세요."
  if (!values.content) errors.content = "내용을 입력해 주세요."
  if (requireAuthor && !values.author) errors.author = "작성자를 입력해 주세요."
  if (!CATEGORIES.includes(values.category)) errors.category = "분류를 선택해 주세요."
  if (values.password.length < 4) errors.password = "비밀번호는 4자 이상 입력해 주세요."
  return { values, errors }
}

// 비밀번호는 다시 채워 넣지 않는다
function echo({ password: _password, ...rest }: Record<string, string>) {
  void _password
  return rest
}

export async function createPostAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { values, errors } = validatePost(formData, true)
  if (Object.keys(errors).length) return { errors, values: echo(values) }

  const id = await createPost(values)
  revalidatePath("/")
  redirect(`/posts/${id}`)
}

export async function updatePostAction(
  id: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { values, errors } = validatePost(formData, false)
  if (Object.keys(errors).length) return { errors, values: echo(values) }

  const result = await updatePost(id, values)
  if (result === "not-found") return { message: "게시글을 찾을 수 없습니다." }
  if (result === "wrong-password")
    return {
      errors: { password: "비밀번호가 일치하지 않습니다." },
      values: echo(values),
    }

  revalidatePath("/")
  revalidatePath(`/posts/${id}`)
  redirect(`/posts/${id}`)
}

export async function deletePostAction(
  id: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await deletePost(id, text(formData, "password"))
  if (result === "not-found") return { message: "게시글을 찾을 수 없습니다." }
  if (result === "wrong-password") return { message: "비밀번호가 일치하지 않습니다." }

  revalidatePath("/")
  redirect("/")
}

export async function addCommentAction(
  postId: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const author = text(formData, "author")
  const content = text(formData, "content")
  const errors: Record<string, string> = {}
  if (!author) errors.author = "이름을 입력해 주세요."
  if (!content) errors.content = "댓글 내용을 입력해 주세요."
  else if (content.length > 500) errors.content = "댓글은 500자 이내로 입력해 주세요."
  if (Object.keys(errors).length) return { errors, values: { author, content } }

  const comment = await addComment(postId, { author, content })
  if (!comment) return { message: "게시글을 찾을 수 없습니다." }

  revalidatePath(`/posts/${postId}`)
  return { ok: true, values: { author } }
}

export async function incrementViewsAction(id: number) {
  await incrementViews(id)
}
