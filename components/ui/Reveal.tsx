'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Fade-and-rise as a section scrolls into view. The animation itself lives in
 * globals.css under [data-reveal]; this only flips the attribute, so
 * prefers-reduced-motion can disable the whole effect in one place.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section'
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.setAttribute('data-reveal', 'shown')
        observer.disconnect()
      },
      { rootMargin: '0px 0px -70px 0px', threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      // @ts-expect-error - ref type varies with the polymorphic tag
      ref={ref}
      data-reveal=""
      className={cn(className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
