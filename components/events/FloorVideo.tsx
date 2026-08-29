'use client'

import { useEffect, useRef } from 'react'
import { AmbientVideo } from '@/components/ui/AmbientVideo'

/**
 * The award clip behind blinds: slats the colour of the section sit over the
 * video and roll up in a cascade as it arrives, then the caption fades in.
 * Heading, video and caption share one column so their left edges line up.
 *
 * The slats are built in JS, so with the script blocked the video is simply
 * visible — the reveal can never leave it hidden.
 */
export function FloorVideo({
  src,
  heading,
  caption,
  card,
  playLabel,
  pauseLabel,
  unmuteLabel,
  muteLabel,
}: {
  src: string
  heading: string
  caption: string
  /** Photo card laid over the clip's bottom-inline-start corner. */
  card?: React.ReactNode
  playLabel: string
  pauseLabel: string
  unmuteLabel: string
  muteLabel: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = root.current
    const box = frame.current
    if (!wrap || !box) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.classList.add('is-in')
      return
    }

    // Same contract as the slats: hide the card only once we can show it.
    wrap.classList.add('floor--armed')

    const n = window.innerWidth < 640 ? 5 : 6
    const step = 80
    const slats: HTMLElement[] = []
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div')
      s.className = 'floor__slat'
      // -1px on the edges and +1px on the height hide sub-pixel seams
      s.style.top = `calc(${(i * 100) / n}% - 1px)`
      s.style.height = `calc(${100 / n}% + 1px)`
      s.style.setProperty('--d', `${i * step}ms`)
      box.appendChild(s)
      slats.push(s)
    }
    wrap.style.setProperty('--d-award', `${(n - 1) * step + 260}ms`)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        wrap.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.3, rootMargin: '0px 0px -6%' }
    )
    io.observe(box)
    const failsafe = window.setTimeout(() => wrap.classList.add('is-in'), 4000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
      slats.forEach((s) => s.remove())
    }
  }, [])

  return (
    <div ref={root} className="floor mt-14">
      <h3 className="text-lg font-semibold">{heading}</h3>
      {/* The card overlaps into this gutter, so it never covers a face. */}
      <div className={card ? 'floor__stage' : undefined}>
        <div
          ref={frame}
          className="floor__video relative mt-5 aspect-video overflow-hidden rounded-panel border border-surface-line bg-brand-950"
        >
          <AmbientVideo
            src={src}
            className="h-full"
            playLabel={playLabel}
            pauseLabel={pauseLabel}
            unmuteLabel={unmuteLabel}
            muteLabel={muteLabel}
          />
        </div>
        {card}
      </div>
      <p className="floor__cap mt-3 text-xs text-slate-muted">{caption}</p>
    </div>
  )
}
