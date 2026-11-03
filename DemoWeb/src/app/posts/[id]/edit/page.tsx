import { notFound } from "next/navigation"
import { Suspense } from "react"

import { updatePostAction } from "@/app/actions"
import { PostForm } from "@/components/post-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPost } from "@/lib/posts"

export default function EditPostPage({ params }: PageProps<"/posts/[id]/edit">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">글 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
          <EditForm params={params} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function EditForm({
  params,
}: {
  params: PageProps<"/posts/[id]/edit">["params"]
}) {
  const { id } = await params
  const post = await getPost(Number(id))
  if (!post) notFound()

  return <PostForm action={updatePostAction.bind(null, post.id)} post={post} />
}
