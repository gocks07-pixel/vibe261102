import Form from "next/form"
import Link from "next/link"
import { Suspense } from "react"
import { MessageSquare, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { listPosts } from "@/lib/posts"
import { CATEGORIES, type Category } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">게시판</CardTitle>
        <CardDescription>자유롭게 글을 남겨 주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ListSkeleton />}>
          <PostList searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function buildHref(params: { q?: string; category?: string; page?: number }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.category) sp.set("category", params.category)
  if (params.page && params.page > 1) sp.set("page", String(params.page))
  const qs = sp.toString()
  return qs ? `/?${qs}` : "/"
}

async function PostList({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"]
}) {
  const sp = await searchParams
  const q = first(sp.q) ?? ""
  const rawCategory = first(sp.category)
  const category = CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : undefined
  const { posts, total, page, totalPages } = await listPosts({
    q,
    category,
    page: Number(first(sp.page)) || 1,
  })

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-1">
          {[undefined, ...CATEGORIES].map((c) => (
            <Link
              key={c ?? "all"}
              href={buildHref({ q, category: c })}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                c === category
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {c ?? "전체"}
            </Link>
          ))}
        </nav>
        <Form action="/" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <Input
            name="q"
            defaultValue={q}
            placeholder="제목, 내용, 작성자 검색"
            className="sm:w-60"
          />
          <Button type="submit" variant="outline" size="icon" aria-label="검색">
            <Search />
          </Button>
        </Form>
      </div>

      <p className="text-sm text-muted-foreground">
        총 <span className="font-medium text-foreground">{total}</span>개의 글
        {q && <> · &ldquo;{q}&rdquo; 검색 결과</>}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">번호</TableHead>
            <TableHead className="w-20 text-center">분류</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="hidden w-28 sm:table-cell">작성자</TableHead>
            <TableHead className="hidden w-28 text-center md:table-cell">작성일</TableHead>
            <TableHead className="hidden w-16 text-center md:table-cell">조회</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                게시글이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow
                key={post.id}
                className={cn(post.category === "공지" && "bg-muted/50")}
              >
                <TableCell className="text-center text-muted-foreground">
                  {post.id}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={post.category === "공지" ? "default" : "secondary"}>
                    {post.category}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-0">
                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <span className="truncate font-medium">{post.title}</span>
                    {post.comments.length > 0 && (
                      <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {post.comments.length}
                      </span>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{post.author}</TableCell>
                <TableCell className="hidden text-center text-muted-foreground md:table-cell">
                  {formatDate(post.createdAt)}
                </TableCell>
                <TableCell className="hidden text-center text-muted-foreground md:table-cell">
                  {post.views}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <nav className="flex justify-center gap-1" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={buildHref({ q, category, page: n })}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-sm",
                n === page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}
