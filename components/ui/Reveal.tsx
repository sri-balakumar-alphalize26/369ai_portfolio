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

    // Failing closed here means invisible content — the worst outcome. If
    // the observer never fires for an element that is actually on screen
    // (edge cases, extensions), reveal it anyway. Guarded by a viewport
    // check so below-fold sections still wait for their scroll entrance.
    const backstop = window.setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.setAttribute('data-reveal', 'shown')
      }
    }, 2500)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        window.clearTimeout(backstop)
        el.setAttribute('data-reveal', 'shown')
        observer.disconnect()
        // The stagger delay has done its job once the entrance finishes;
        // clearing it keeps any later transition on this element immediate.
        window.setTimeout(() => {
          el.style.transitionDelay = '0ms'
        }, delay + 700)
      },
      { rootMargin: '0px 0px -70px 0px', threshold: 0.05 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(backstop)
    }
  }, [delay])

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
