'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Deck fan-in entrance for a grid of cards: children marked .deck-card start
 * gathered at the grid's center, slightly fanned, and deal out to their slots
 * when the grid scrolls into view. Each card's travel is MEASURED into --dx
 * (not guessed), so the effect works at any column count. The motion lives in
 * globals.css under .deck-card, on translate/rotate/scale as separate
 * properties so card-glow's hover transform composes instead of colliding.
 * Observer settings and the fail-open backstop mirror Reveal.tsx.
 */
export function DeckReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const grid = ref.current
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(':scope > .deck-card'))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      grid.classList.add('is-visible')
      return
    }

    const gb = grid.getBoundingClientRect()
    const cx = gb.left + gb.width / 2
    cards.forEach((c, i) => {
      const b = c.getBoundingClientRect()
      c.style.setProperty('--dx', `${Math.round(cx - (b.left + b.width / 2))}px`)
      c.style.setProperty('--rot', `${((i - (cards.length - 1) / 2) * 2.6).toFixed(1)}deg`)
      c.style.transitionDelay = `${i * 90}ms`
    })

    let delayCleanup = 0
    function show() {
      grid!.classList.add('is-visible')
      // The stagger has done its job once the deal finishes; clearing it
      // keeps the card-glow hover immediate (same cleanup as Reveal.tsx).
      delayCleanup = window.setTimeout(() => {
        cards.forEach((c) => {
          c.style.transitionDelay = '0ms'
        })
      }, cards.length * 90 + 720)
    }

    // Fail open: invisible content is the worst outcome (Reveal.tsx idiom).
    const backstop = window.setTimeout(() => {
      const r = grid.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) show()
    }, 2500)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        window.clearTimeout(backstop)
        show()
        observer.disconnect()
      },
      { rootMargin: '0px 0px -70px 0px', threshold: 0.05 }
    )
    observer.observe(grid)

    return () => {
      observer.disconnect()
      window.clearTimeout(backstop)
      window.clearTimeout(delayCleanup)
    }
  }, [])

  return (
    <ul ref={ref} className={cn(className)}>
      {children}
    </ul>
  )
}
