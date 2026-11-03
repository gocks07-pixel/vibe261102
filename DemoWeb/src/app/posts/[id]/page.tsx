import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, Eye, Pencil } from "lucide-react"

import { CommentForm } from "@/components/comment-form"
import { DeletePostButton } from "@/components/delete-post-button"
import { ViewCounter } from "@/components/view-counter"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateTime } from "@/lib/format"
import { getPost } from "@/lib/posts"

export default function PostPage({ params }: PageProps<"/posts/[id]">) {
  return (
    <div className="grid gap-4">
      <Link
        href="/"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}
      >
        <ArrowLeft />
        목록으로
      </Link>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <PostDetail params={params} />
      </Suspense>
    </div>
  )
}

async function PostDetail({ params }: { params: PageProps<"/posts/[id]">["params"] }) {
  const { id } = await params
  const post = await getPost(Number(id))
  if (!post) notFound()

  return (
    <>
      <ViewCounter postId={post.id} />
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={post.category === "공지" ? "default" : "secondary"}>
              {post.category}
            </Badge>
          </div>
          <CardTitle className="text-2xl leading-snug">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.author}</span>
            <span>{formatDateTime(post.createdAt)}</span>
            {post.updatedAt !== post.createdAt && <span>(수정됨)</span>}
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {post.views}
            </span>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="min-h-40 py-2 leading-7 whitespace-pre-wrap">
          {post.content}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil />
            수정
          </Link>
          <DeletePostButton postId={post.id} />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>댓글 {post.comments.length}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {post.comments.length > 0 && (
            <ul className="grid gap-3">
              {post.comments.map((comment) => (
                <li key={comment.id} className="rounded-lg border bg-background p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
          <CommentForm postId={post.id} />
        </CardContent>
      </Card>
    </>
  )
}
