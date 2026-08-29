'use client'

import { useEffect, type RefObject } from 'react'

type Options = {
  /**
   * Pause a card's <video> once it is mostly covered, and resume it when it
   * becomes the front card. A stack of clips would otherwise decode all of
   * them at once. Safe against AmbientVideo's own observer, which only acts
   * on intersection *changes*, not continuously.
   */
  pauseCoveredVideos?: boolean
}

/**
 * The scroll-stacking deck: every `.stack-card` inside `ref` is sticky at the
 * same offset (globals.css `.card-stack`), so each card slides up and covers
 * the one pinned beneath it. This hook supplies the two things CSS cannot:
 *
 * 1. equal card heights, so nothing peeks out beneath a shorter card;
 * 2. `--depth` per card — how far it has been pushed back by the cards on top
 *    of it — which CSS turns into the step-up / shrink / dim of the pile.
 *
 * Heights are layout, not motion, so they are applied even under
 * prefers-reduced-motion; only the depth response is skipped there.
 */
export function useCardStack(
  ref: RefObject<HTMLElement | null>,
  { pauseCoveredVideos = false }: Options = {}
) {
  useEffect(() => {
    const cards = Array.from(ref.current?.querySelectorAll<HTMLElement>('.stack-card') ?? [])
    if (cards.length < 2) return

    // Only at lg: on phones one card is often far taller than the rest, and
    // forcing every card to match it would leave holes.
    function equalize() {
      cards.forEach((c) => {
        c.style.minHeight = ''
      })
      if (window.innerWidth < 1024) return
      const max = Math.max(...cards.map((c) => c.offsetHeight))
      cards.forEach((c) => {
        c.style.minHeight = `${max}px`
      })
    }

    // Same bail as the Header's scroll handler — under reduced motion the CSS
    // zeroes the deck response anyway; skipping the listener keeps scroll cheap.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let resizeFrame = 0

    // depth_i = the sum of how much each later card has covered its
    // predecessor. Depths are zeroed before measuring so the rects are the
    // untransformed boxes — otherwise a card's own shift would feed back into
    // its own reading.
    function measure() {
      if (reduced) return
      cards.forEach((c) => c.style.setProperty('--depth', '0'))
      const rects = cards.map((c) => c.getBoundingClientRect())
      let depth = 0
      for (let i = cards.length - 1; i >= 0; i--) {
        if (i < cards.length - 1) {
          const a = rects[i]
          const b = rects[i + 1]
          depth += Math.min(1, Math.max(0, (a.bottom - b.top) / a.height))
        }
        cards[i].style.setProperty('--depth', depth.toFixed(3))

        if (pauseCoveredVideos) {
          const video = cards[i].querySelector('video')
          if (video) {
            const buried = depth > 0.6
            if (buried) {
              if (!video.paused) video.pause()
            } else if (video.paused) {
              // Only the front card is ever fetched, so covering a card can
              // never abort a download that had just started.
              video.preload = 'auto'
              video.play().catch(() => undefined)
            }
          }
        }
      }
    }

    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    function onResize() {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        equalize()
        measure()
      })
    }

    equalize()
    measure()
    window.addEventListener('resize', onResize, { passive: true })
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [ref, pauseCoveredVideos])
}
