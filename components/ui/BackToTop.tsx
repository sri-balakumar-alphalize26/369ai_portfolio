'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * How far down the page before the button arrives, in pixels.
 *
 * Absolute, not a share of the scrollable distance: a proportion means a long
 * page withholds the button for thousands of pixels while a short one offers
 * it almost at once, which is backwards — the longer the page, the sooner a
 * reader wants the way back. 200px is about two wheel notches, so it is past
 * an accidental nudge but well inside the first screen.
 */
const SHOW_AT = 200

/** Matches the longest leg of the click animation in globals.css. */
const FIRE_MS = 520

/**
 * The floating return to the top of the page.
 *
 * It parks to the inline-start of the Assistant launcher and slides out from
 * behind it — hence `z-[59]` against the launcher's `z-[60]`, so the launcher
 * paints over it in transit. Beside, not above: the greeting bubble and the
 * chat panel both occupy `bottom-24`, and a button parked there had to hide
 * itself for the first several seconds of every visit.
 *
 * No reduced-motion branch on the scroll itself — browsers honour the setting
 * for `behavior: 'smooth'` natively. It only silences the CSS transitions.
 */
export function BackToTop() {
  const t = useTranslations('common')
  const [shown, setShown] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const fireTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let frame = 0

    function measure() {
      setShown(window.scrollY >= SHOW_AT)
    }

    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    // A resize can reflow the page and clamp the scroll position without a
    // scroll event being guaranteed to follow it.
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  useEffect(() => () => { if (fireTimer.current) clearTimeout(fireTimer.current) }, [])

  function onClick() {
    const node = ref.current
    if (node) {
      // Driven through the DOM rather than state: the class has to be removed,
      // the removal forced through a reflow, then re-added, or a second click
      // inside the animation coalesces into no change at all. React's batching
      // cannot express that, and a transient animation is not app state.
      node.classList.remove('is-firing')
      void node.offsetWidth
      node.classList.add('is-firing')
      if (fireTimer.current) clearTimeout(fireTimer.current)
      fireTimer.current = setTimeout(() => node.classList.remove('is-firing'), FIRE_MS)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={t('backToTop')}
      /* Out of the tab order while parked — a button that has slid away is
         still focusable otherwise. */
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={cn(
        'btt fixed bottom-6 end-[5.5rem] z-[59] h-12 w-12 cursor-pointer rounded-full sm:end-[5.75rem]',
        shown && 'is-visible'
      )}
    >
      <span className="btt-disc" />
      <span className="btt-glyph" aria-hidden>
        <ChevronUp className="text-white" strokeWidth={2.4} />
        <ChevronUp className="text-white" strokeWidth={2.4} />
      </span>
    </button>
  )
}
