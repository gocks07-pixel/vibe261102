"use client"

import Link from "next/link"
import { useActionState } from "react"

import { FieldError } from "@/components/field-error"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, type FormState, type PublicPost } from "@/lib/types"

const categoryItems = CATEGORIES.map((c) => ({ value: c, label: c }))

export function PostForm({
  action,
  post,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  /** 수정 모드일 때 기존 게시글 */
  post?: PublicPost
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const isEdit = Boolean(post)
  const values = { ...post, ...state.values }

  return (
    <form action={formAction} className="grid gap-5">
      {state.message && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <div className="grid gap-2">
          <Label htmlFor="category">분류</Label>
          <Select
            key={values.category}
            name="category"
            items={categoryItems}
            defaultValue={values.category ?? "자유"}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.errors?.category} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            maxLength={100}
            defaultValue={values.title}
            placeholder="제목을 입력하세요"
            aria-invalid={Boolean(state.errors?.title)}
          />
          <FieldError message={state.errors?.title} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={12}
          className="min-h-64"
          defaultValue={values.content}
          placeholder="내용을 입력하세요"
          aria-invalid={Boolean(state.errors?.content)}
        />
        <FieldError message={state.errors?.content} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="author">작성자</Label>
          <Input
            id="author"
            name="author"
            maxLength={20}
            defaultValue={values.author}
            disabled={isEdit}
            placeholder="이름"
            aria-invalid={Boolean(state.errors?.author)}
          />
          <FieldError message={state.errors?.author} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="off"
            placeholder={isEdit ? "작성 시 입력한 비밀번호" : "수정·삭제 시 사용 (4자 이상)"}
            aria-invalid={Boolean(state.errors?.password)}
          />
          <FieldError message={state.errors?.password} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={post ? `/posts/${post.id}` : "/"}
          className={buttonVariants({ variant: "outline" })}
        >
          취소
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : isEdit ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </form>
  )
}
