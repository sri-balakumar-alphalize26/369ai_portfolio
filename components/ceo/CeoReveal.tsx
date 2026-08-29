'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The CEO page's two entrances. Both work the same way: arm first — that is
 * what hides anything — then reveal a frame later, so a blocked script can
 * never leave the copy invisible. `ln--armed` is what the shared line-mask
 * rules look for; the rest hangs off `is-armed` / `is-in` in globals.css.
 *
 * on="mount": the hero, which is above the fold. Two rAFs, because flipping
 * the class in the first paint leaves the browser no "before" to animate from.
 * on="view": the award block, revealed when it scrolls up, with a failsafe.
 */
export function CeoReveal({
  on = 'view',
  className,
  children,
}: {
  on?: 'mount' | 'view'
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('is-armed', 'ln--armed')

    if (on === 'mount') {
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => el.classList.add('is-in'))
      })
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.2, rootMargin: '0px 0px -8%' }
    )
    io.observe(el)
    const failsafe = window.setTimeout(() => el.classList.add('is-in'), 4000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [on])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
