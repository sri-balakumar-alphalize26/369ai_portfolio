'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The event hero photo: it swings open like a door as it arrives, and an
 * arrow circles its frame — anti-clockwise for one event, clockwise for the
 * other. The direction is baked into the PATH (start edge + arc sweep flag),
 * so a single keyframe drives both and the arrowhead, which rides the same
 * path, always points the way it travels.
 *
 * `perspective()` sits inside this element's own transform, never on an
 * ancestor: an ancestor perspective becomes a containing block and would
 * break the sticky card stack further down the page.
 */
export function EventMedia({
  direction,
  hinge = 'start',
  tone = 'accent',
  className,
  children,
}: {
  direction: 'cw' | 'ccw'
  hinge?: 'start' | 'end'
  /** Which brand colour the perimeter arrow is drawn in. */
  tone?: 'accent' | 'brand'
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      box.classList.add('is-in')
      return
    }

    // Hiding the photo is only safe once we know we can show it again.
    box.classList.add('ev-media--armed')

    const ns = 'http://www.w3.org/2000/svg'
    const id = `evFrame-${Math.random().toString(36).slice(2, 9)}`

    /** Rounded rectangle, traced in the requested direction. */
    function pathFor(w: number, h: number, inset: number, r: number) {
      const x = inset
      const y = inset
      const W = w - inset * 2
      const H = h - inset * 2
      r = Math.min(r, W / 2, H / 2)
      if (direction === 'cw') {
        // starts along the top edge, arcs sweep 1
        return `M ${x + r} ${y} H ${x + W - r} A ${r} ${r} 0 0 1 ${x + W} ${y + r} V ${y + H - r} A ${r} ${r} 0 0 1 ${x + W - r} ${y + H} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + H - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`
      }
      // starts down the left edge, arcs sweep 0
      return `M ${x} ${y + r} V ${y + H - r} A ${r} ${r} 0 0 0 ${x + r} ${y + H} H ${x + W - r} A ${r} ${r} 0 0 0 ${x + W} ${y + H - r} V ${y + r} A ${r} ${r} 0 0 0 ${x + W - r} ${y} H ${x + r} A ${r} ${r} 0 0 0 ${x} ${y + r} Z`
    }

    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('class', 'ev-frame')
    svg.setAttribute('aria-hidden', 'true')
    // Built through the DOM rather than JSX: it needs the measured box first,
    // and animateMotion/mpath sidestep React's SVG attribute handling.
    svg.innerHTML =
      `<path class="rail" id="${id}" pathLength="1"></path>` +
      `<path class="comet" pathLength="1"></path>` +
      `<path class="head" d="M -7 -7 L 10 0 L -7 7 L -2 0 Z">` +
      `<animateMotion dur="4s" begin="-0.56s" repeatCount="indefinite" rotate="auto">` +
      `<mpath href="#${id}"></mpath></animateMotion></path>`
    box.appendChild(svg)

    function size() {
      const w = box!.clientWidth
      const h = box!.clientHeight
      if (!w || !h) return
      // Negative inset: the ring sits OUTSIDE the picture (the svg is
      // overflow:visible), which is why the wrapper must not clip.
      const d = pathFor(w, h, -9, 18)
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.querySelector('.rail')?.setAttribute('d', d)
      svg.querySelector('.comet')?.setAttribute('d', d)
    }
    size()

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        box!.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.25 }
    )
    io.observe(box)
    const failsafe = window.setTimeout(() => box.classList.add('is-in'), 4000)

    let rt = 0
    function onResize() {
      window.clearTimeout(rt)
      rt = window.setTimeout(size, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(rt)
      window.clearTimeout(failsafe)
      svg.remove()
    }
  }, [direction])

  return (
    <div
      ref={ref}
      className={cn('ev-media relative', className)}
      data-hinge={hinge}
      style={
        {
          '--ev-arrow':
            tone === 'brand' ? 'var(--color-brand-600)' : 'var(--color-accent-500)',
        } as React.CSSProperties
      }
    >
      <div className="ev-door relative h-full w-full overflow-hidden rounded-panel border border-surface-line">
        {children}
      </div>
    </div>
  )
}
