'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/** How long between automatic gleams. Hovering restarts this clock. */
const GLEAM_EVERY_MS = 5_000

/**
 * The header logo, in two layers so it can animate.
 *
 * The wordmark wipes in left to right while the orange arrow draws upward from
 * its own base, and the two OVERLAP on purpose. The arrow crosses the 6, so the
 * wordmark layer has a notch cut out of it there (see scripts/generate-logo-
 * layers.mjs); if the arrow arrived after the wipe finished, the 6 would sit
 * visibly broken open for a beat. The timing that prevents that lives in
 * globals.css — `--arrow-delay` carries the warning.
 *
 * The base layer is in normal flow and gives the element its size; the arrow is
 * laid over it. Both come off the same canvas, so they need no alignment.
 *
 * The entrance waits for the first-visit splash to lift. Playing it underneath
 * a full-screen loader would burn the one thing it exists to show. On a repeat
 * visit the splash takes its sessionStorage fast path and is already gone, so
 * this resolves immediately.
 */
export function BrandLogo({ alt }: { alt: string }) {
  const [entered, setEntered] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let frame = 0
    // A frame's grace either way, so the first paint is the settled logo and
    // the wipe starts from a composited layer rather than during layout.
    const start = () => {
      frame = requestAnimationFrame(() => setEntered(true))
    }

    const gone = () => !document.getElementById('page-loader')
    if (gone()) {
      start()
      return () => cancelAnimationFrame(frame)
    }

    // The splash removes itself from <body>; it does not signal anyone.
    const observer = new MutationObserver(() => {
      if (!gone()) return
      observer.disconnect()
      start()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  // Remove, force a reflow, re-add — or a gleam requested while one is already
  // running coalesces into no change at all.
  const gleam = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.classList.remove('is-gleaming')
    void node.offsetWidth
    node.classList.add('is-gleaming')
  }, [])

  const arm = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(gleam, GLEAM_EVERY_MS)
  }, [gleam])

  useEffect(() => {
    if (!entered) return
    arm()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [entered, arm])

  return (
    <span
      ref={ref}
      className="brand-logo"
      data-entered={entered}
      /* Hovering gleams at once and restarts the clock, so a hover and the
         automatic fire can never land on top of each other. */
      onMouseEnter={() => {
        if (!entered) return
        gleam()
        arm()
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'bl-gleam') ref.current?.classList.remove('is-gleaming')
      }}
    >
      <Image
        src="/images/brand/logo-base.png"
        alt={alt}
        width={353}
        height={334}
        priority
        className="bl-base h-10 w-auto sm:h-12"
      />
      <Image
        src="/images/brand/logo-arrow.png"
        alt=""
        width={353}
        height={334}
        priority
        aria-hidden
        className="bl-arrow"
      />
      <span className="bl-gleam" aria-hidden />
    </span>
  )
}
