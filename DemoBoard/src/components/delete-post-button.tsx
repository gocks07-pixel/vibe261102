"use client"

import { Trash2 } from "lucide-react"
import { useActionState } from "react"

import { deletePostAction } from "@/app/actions"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldError } from "@/components/field-error"

export function DeletePostButton({ postId }: { postId: number }) {
  const [state, formAction, pending] = useActionState(
    deletePostAction.bind(null, postId),
    {}
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 />
        삭제
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>게시글을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제한 게시글은 되돌릴 수 없습니다. 작성 시 입력한 비밀번호를 입력해 주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              autoComplete="off"
              autoFocus
              aria-invalid={Boolean(state.message)}
            />
            <FieldError message={state.message} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">취소</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
