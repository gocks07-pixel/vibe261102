"use client"

import { useEffect, useRef } from "react"

import { incrementViewsAction } from "@/app/actions"

/** 상세 페이지를 실제로 연 경우에만 조회수를 올린다 (프리페치로는 증가하지 않음) */
export function ViewCounter({ postId }: { postId: number }) {
  const counted = useRef<number | null>(null)

  useEffect(() => {
    if (counted.current === postId) return
    counted.current = postId
    void incrementViewsAction(postId)
  }, [postId])

  return null
}
