'use client'

import { useEffect, useRef } from 'react'
import { AmbientVideo } from '@/components/ui/AmbientVideo'

/**
 * The award clip on /ceo. A panel the colour of the band covers the video and
 * sweeps off to the trailing edge on a slight skew, an accent edge running
 * ahead of it, then the caption fades up. The Events page keeps its blinds
 * (FloorVideo) — this reveal belongs to the CEO page alone.
 *
 * Like the blinds, the cover is built with CSS the component only switches on:
 * with the script blocked the failsafe never fires either, so the panels are
 * pinned open by prefers-reduced-motion and the clip is plainly visible.
 */
export function AwardVideo({
  src,
  heading,
  caption,
  playLabel,
  pauseLabel,
  unmuteLabel,
  muteLabel,
}: {
  src: string
  heading: string
  caption: string
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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        wrap.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.3, rootMargin: '0px 0px -6%' }
    )
    io.observe(box)

    // Never leave the clip behind the panel, whatever the observer does.
    const failsafe = window.setTimeout(() => wrap.classList.add('is-in'), 4000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <div ref={root} className="pres mt-14">
      <h3 className="text-lg font-semibold">{heading}</h3>
      {/* The panels are wider than this box and overshoot top and bottom, so
          the skew can never expose a corner — the frame has to clip. */}
      <div
        ref={frame}
        className="pres__video relative mt-5 aspect-video overflow-hidden rounded-panel border border-surface-line bg-brand-950"
      >
        <AmbientVideo
          src={src}
          className="h-full"
          playLabel={playLabel}
          pauseLabel={pauseLabel}
          unmuteLabel={unmuteLabel}
          muteLabel={muteLabel}
        />
        <div className="pres__swipe" aria-hidden />
        <div className="pres__edge" aria-hidden />
      </div>
      <p className="pres__cap mt-3 text-sm text-slate-faint">{caption}</p>
    </div>
  )
}
