import Link from "next/link"
import { PenSquare, MessagesSquare } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessagesSquare className="size-5" />
          DemoBoard
        </Link>
        <Link href="/posts/new" className={buttonVariants({ size: "sm" })}>
          <PenSquare />
          글쓰기
        </Link>
      </div>
    </header>
  )
}
