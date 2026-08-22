'use client'

import { useEffect, useState } from 'react'

/**
 * Thin brand-gradient bar tracking read progress.
 * Replaces the preloader: same sense of polish, but it never covers content
 * and it costs the visitor nothing.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className="scroll-progress w-full"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden
    />
  )
}
