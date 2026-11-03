"use client"

import { useActionState } from "react"

import { addCommentAction } from "@/app/actions"
import { FieldError } from "@/components/field-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CommentForm({ postId }: { postId: number }) {
  const [state, formAction, pending] = useActionState(
    addCommentAction.bind(null, postId),
    {}
  )

  return (
    <form action={formAction} className="grid gap-3">
      {state.message && <FieldError message={state.message} />}
      <div className="grid gap-1 sm:max-w-xs">
        <Input
          name="author"
          placeholder="이름"
          defaultValue={state.values?.author}
          maxLength={20}
          aria-invalid={Boolean(state.errors?.author)}
        />
        <FieldError message={state.errors?.author} />
      </div>
      <div className="grid gap-1">
        <Textarea
          name="content"
          rows={3}
          maxLength={500}
          placeholder="댓글을 입력하세요"
          defaultValue={state.ok ? "" : state.values?.content}
          aria-invalid={Boolean(state.errors?.content)}
        />
        <FieldError message={state.errors?.content} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  )
}
