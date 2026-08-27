'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Group reveal trigger: adds .is-visible to the list when it scrolls into
 * view, and nothing else — each child carries its own --d custom property,
 * so every beat of its entrance (card, flood, glyph) reads the same delay
 * and none can be left behind. The motion itself lives in globals.css.
 * Observer settings and the fail-open backstop mirror Reveal.tsx.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible')
      return
    }

    const backstop = window.setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible')
    }, 2500)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        window.clearTimeout(backstop)
        el.classList.add('is-visible')
        observer.disconnect()
      },
      { rootMargin: '0px 0px -70px 0px', threshold: 0.05 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      window.clearTimeout(backstop)
    }
  }, [])

  return (
    <ul ref={ref} className={cn(className)}>
      {children}
    </ul>
  )
}
