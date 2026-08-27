'use client'

import { useEffect, useRef } from 'react'

const RADIUS = 110
const PULL = 0.3 // above ~0.4 the button reads as dodging the cursor, not inviting it

/**
 * Magnetic pull for a CTA button: once the pointer is within RADIUS of the
 * button's center, the button drifts toward it at PULL of the distance.
 * The OUTER span is what gets measured and never moves — measuring the
 * moving element itself would shift the center as it drifts and jitter at
 * the radius edge. Pointer-only and motion-safe: touch devices and
 * prefers-reduced-motion get a static button.
 */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const b = outer!.getBoundingClientRect()
        const dx = e.clientX - (b.left + b.width / 2)
        const dy = e.clientY - (b.top + b.height / 2)
        if (Math.hypot(dx, dy) < RADIUS) {
          inner!.style.translate = `${dx * PULL}px ${dy * PULL}px`
        } else {
          inner!.style.translate = '0px 0px'
        }
      })
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <span ref={outerRef} className="inline-block">
      <div ref={innerRef} className="magnetic-inner">
        {children}
      </div>
    </span>
  )
}
