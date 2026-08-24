'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Shared "connected" stage for a row of cards: a connector line draws
 * behind the row, then a data pulse travels along it on a loop while the
 * stage is on screen. The line only shows in the gaps because the cards
 * are opaque and stacked above it — give the grid the `connected-grid`
 * class so its items get position + z-index.
 *
 * Geometry: the line's `top` in globals.css assumes cards with p-7
 * padding and an h-11 icon tile, so it crosses the icon-tile centres.
 *
 * The pulse is transform-based (translateX to a JS-measured --travel),
 * never `left` — left triggers layout every frame. The observer that
 * gates it also pauses the infinite loop while the stage is off screen.
 */
export function ConnectedStage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new IntersectionObserver(
      ([entry]) => stage.setAttribute('data-inview', String(entry.isIntersecting)),
      { threshold: 0.25 }
    )
    observer.observe(stage)

    // Travel distance = the connector's real width, sign-flipped under RTL so
    // the dot still runs start -> end. Re-measured on (debounced) resize.
    let timer: ReturnType<typeof setTimeout> | null = null
    const measure = () => {
      const line = lineRef.current
      const pulse = pulseRef.current
      if (!line || !pulse) return
      const rtl = document.documentElement.dir === 'rtl'
      const width = Math.max(0, line.getBoundingClientRect().width - 9)
      pulse.style.setProperty('--travel', `${rtl ? -width : width}px`)
    }
    const onResize = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(measure, 150)
    }
    measure()
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <div ref={stageRef} className={cn('connected-stage', className)} data-inview="false">
      <div ref={lineRef} aria-hidden className="connected-line hidden lg:block" />
      <div ref={pulseRef} aria-hidden className="connected-pulse hidden lg:block" />
      {children}
    </div>
  )
}
