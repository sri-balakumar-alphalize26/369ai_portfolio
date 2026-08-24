'use client'

import { useEffect, useRef, useState } from 'react'

const CYCLE_MS = 2200
const SLIDE_MS = 500

/**
 * "Technology that drives efficiency / accuracy / growth" — the last word
 * cycles. Server render (and no-JS, and reduced motion) shows the complete
 * static sentence; the rotator only takes over after hydration.
 *
 * The slot is a fixed-height clipped box with the words stacked plus a clone
 * of the first at the end — landing on the clone then resetting with
 * transition:none is what makes the wrap seamless. Width is measured once
 * against the longest word so the line never jitters; height is locked to the
 * heading's computed line-height so the words sit on the baseline.
 */
export function RotatingTitle({
  full,
  lead,
  words,
}: {
  /** The complete sentence, for SSR, reduced motion and assistive tech. */
  full: string
  lead: string
  words: string[]
}) {
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [snap, setSnap] = useState(false)

  const rootRef = useRef<HTMLSpanElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const [slot, setSlot] = useState<{ width: number; height: number } | null>(null)
  const inView = useRef(true)

  // Activate after hydration — unless the visitor prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // deferred a frame: activation swaps SSR text for the rotator, and doing
    // it synchronously inside the effect would cascade renders
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Measure the slot: widest word (hidden probe) x the heading's line-height.
  useEffect(() => {
    if (!active) return
    const probe = probeRef.current
    const root = rootRef.current
    if (!probe || !root) return
    const id = requestAnimationFrame(() => {
      const width = Math.ceil(probe.getBoundingClientRect().width)
      const height = parseFloat(getComputedStyle(root).lineHeight)
      if (width && height) setSlot({ width, height })
    })
    return () => cancelAnimationFrame(id)
  }, [active])

  // Advance while on screen; pause the loop when scrolled away.
  useEffect(() => {
    if (!slot) return
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
    })
    observer.observe(root)

    const timer = setInterval(() => {
      if (!inView.current) return
      setIndex((i) => i + 1)
    }, CYCLE_MS)
    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [slot])

  // Landed on the clone (index === words.length): snap back to 0 unseen.
  useEffect(() => {
    if (index !== words.length) return
    const timer = setTimeout(() => {
      setSnap(true)
      setIndex(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setSnap(false)))
    }, SLIDE_MS + 50)
    return () => clearTimeout(timer)
  }, [index, words.length])

  if (!active || !slot) {
    return (
      <span ref={rootRef}>
        {full}
        {active ? (
          // invisible probe of the longest word, measured before first swap
          <span
            ref={probeRef}
            aria-hidden
            className="pointer-events-none absolute opacity-0"
          >
            {words.reduce((a, b) => (b.length > a.length ? b : a), '')}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <span ref={rootRef} aria-label={full}>
      <span aria-hidden>
        {lead}{' '}
        <span
          className="rotate-slot text-brand-600"
          style={{ width: slot.width, height: slot.height }}
        >
          <span
            className="rotate-stack"
            style={{
              transform: `translateY(-${index * slot.height}px)`,
              transition: snap ? 'none' : `transform ${SLIDE_MS}ms cubic-bezier(.16,1,.3,1)`,
            }}
          >
            {[...words, words[0]].map((word, i) => (
              <span key={i} className="block" style={{ height: slot.height }}>
                {word}
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  )
}
