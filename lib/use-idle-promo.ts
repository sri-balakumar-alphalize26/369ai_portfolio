'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { locales } from '@/i18n/routing'
import { promoFor, type PromoKind } from '@/content/promo'

/**
 * Decides whether the idle advertisement may open, and remembers the answer
 * (components/promo/IdlePromo.tsx).
 *
 * Idle on its own is a weak signal: 45s without scrolling usually means
 * someone is reading, so a bare timer fires hardest on the most engaged
 * visitors. Every condition below has to hold at the moment it fires, and
 * the page has to be one of the four on the allow-list in content/promo.ts.
 *
 * The tick is a 1Hz interval compared against a timestamp rather than a
 * timeout re-armed on every event: a mousemove then costs one assignment,
 * and the DOM predicates run at most once a second. The ad lands somewhere
 * in 45.0–46.0s, which nobody can perceive.
 */
const IDLE_MS = 45_000
const DWELL_MS = 15_000
const MIN_DEPTH = 0.4
const MIN_WIDTH = 380
const TICK_MS = 1_000
const MUTE_MS = 24 * 60 * 60 * 1000

/**
 * localStorage is a new precedent here — the codebase had only two
 * sessionStorage keys ('369:seen', '369ai:greeting-dismissed') — but a
 * dismissal has to outlive the tab, so it has no choice. Same '369ai:'
 * prefix, same try/catch on both ends.
 *
 *   369ai:promo-hidden   'never' | an epoch-ms deadline, muted until then
 *   369ai:promo-seen     '1' while this tab lives — once per visit
 */
const HIDE_KEY = '369ai:promo-hidden'
const SEEN_KEY = '369ai:promo-seen'

/** Survives client-side navigation; the layout never remounts. */
let shownThisVisit = false

function muted(): boolean {
  try {
    const value = localStorage.getItem(HIDE_KEY)
    if (!value) return false
    if (value === 'never') return true
    const until = Number(value)
    if (!Number.isFinite(until)) return false
    // A deadline further out than the window can legitimately be means the
    // device clock jumped — treat it as expired rather than muting this
    // visitor forever.
    if (until - Date.now() > MUTE_MS) return false
    return until > Date.now()
  } catch {
    /* Storage blocked — private mode, partitioned context. Fail closed: an
       ad we cannot remember being dismissed would return on every page,
       which is the exact intrusion this design is avoiding. */
    return true
  }
}

function remember(value: 'never' | number) {
  try {
    localStorage.setItem(HIDE_KEY, String(value))
  } catch {
    /* storage blocked — the memory is lost, but shownThisVisit still holds
       for the rest of this tab */
  }
}

/** The path section, locale stripped. `/en` → '', `/ar/careers/x` → 'careers'. */
function sectionOf(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  const known = (locales as readonly string[]).includes(parts[0])
  return (known ? parts[1] : parts[0]) ?? ''
}

function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true
}

/**
 * Watching, not merely playing. AmbientVideo autoplays a muted loop whenever
 * it is on screen and /about — one of the four allowed pages — has one, so a
 * literal "no video playing" rule would silence the ad there for good. A
 * muted loop is decoration; sound means someone is actually watching.
 */
function isWatching(): boolean {
  if (document.fullscreenElement) return true
  for (const video of document.querySelectorAll('video')) {
    if (video.paused || video.ended) continue
    if (!video.muted) return true
  }
  return false
}

/**
 * Something else already owns the screen. Covers both overlay families: the
 * native <dialog> modals, the portalled fixed overlays (Lightbox,
 * EnquiryDialog, ProductGallery, LeadershipVideos) which carry aria-modal,
 * the Assistant chat panel which carries only role="dialog", and the header
 * menu, which locks body scroll and has neither.
 *
 * Careful: the careers dialogs stay mounted while closed and are safe only
 * because none carries an explicit role="dialog" attribute — adding one
 * would silence this ad site-wide.
 */
function isBusy(): boolean {
  if (document.querySelector('dialog[open], [aria-modal="true"], [role="dialog"]')) return true
  return document.body.style.overflow === 'hidden'
}

export function useIdlePromo(): {
  kind: PromoKind | null
  open: boolean
  dismiss: () => void
  convert: () => void
} {
  const pathname = usePathname()
  const kind = promoFor(sectionOf(pathname))
  const [open, setOpen] = useState(false)

  // Keyed on the path: a client-side navigation re-runs the whole thing, so
  // the allow-list is re-read, the dwell clock and the depth baseline start
  // again for the new page, and an open ad never outlives the page it was
  // for. What must NOT reset is "once per visit" — hence module scope.
  useEffect(() => {
    setOpen(false)
    if (!kind) return

    // Dev-only: ?promo fires it in a couple of seconds instead of 45, and
    // ignores the stored memory. Read from location rather than
    // useSearchParams(), which would force a client bailout on these
    // statically rendered pages.
    const forced =
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).has('promo')

    if (!forced) {
      if (shownThisVisit) return
      try {
        if (sessionStorage.getItem(SEEN_KEY) === '1') return
      } catch {
        /* storage blocked — shownThisVisit is the only guard left */
      }
      if (muted()) return
    }

    const idleMs = forced ? 1_500 : IDLE_MS
    const dwellMs = forced ? 0 : DWELL_MS
    const minDepth = forced ? 0 : MIN_DEPTH

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const enteredAt = Date.now()
    let lastActivity = enteredAt
    let depth = 0
    let frame = 0
    let fired = false

    // All an activity listener is allowed to cost.
    const poke = () => {
      lastActivity = Date.now()
    }

    function onScroll() {
      lastActivity = Date.now()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        // A page too short to scroll has been seen in full, so depth is
        // satisfied — otherwise the ad could never fire on one.
        depth = max > 0 ? window.scrollY / max : 1
      })
    }

    function eligible() {
      if (Date.now() - enteredAt < dwellMs) return false
      if (document.visibilityState !== 'visible') return false
      if (depth < minDepth) return false
      if (window.innerWidth < MIN_WIDTH) return false
      if (isTyping()) return false
      if (isWatching()) return false
      if (isBusy()) return false
      return true
    }

    function fire() {
      if (fired) return
      fired = true
      shownThisVisit = true
      // Written when it fires, never on mount: StrictMode double-invokes
      // effects in development and would otherwise burn the visit.
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage blocked — shownThisVisit still holds for this tab */
      }
      setOpen(true)
    }

    function onTick() {
      if (fired) return
      if (Date.now() - lastActivity >= idleMs && eligible()) fire()
    }

    // Desktop's second trigger: the pointer leaving past the top edge is a
    // genuine "about to go" signal. Touch has no such thing, which is what
    // idle carries there.
    function onExit(event: MouseEvent) {
      if (!fine.matches || event.relatedTarget || event.clientY > 8) return
      if (eligible()) fire()
    }

    const activity = ['mousemove', 'keydown', 'touchstart', 'click'] as const
    // Capture, for the reason RouteLoader uses it: a stopPropagation()
    // anywhere in the tree must not be able to hide activity from us.
    const options = { passive: true, capture: true } as const

    onScroll()
    const timer = window.setInterval(onTick, TICK_MS)
    window.addEventListener('scroll', onScroll, { passive: true })
    for (const event of activity) window.addEventListener(event, poke, options)
    document.addEventListener('visibilitychange', poke)
    document.addEventListener('mouseout', onExit)

    return () => {
      window.clearInterval(timer)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      for (const event of activity) window.removeEventListener(event, poke, options)
      document.removeEventListener('visibilitychange', poke)
      document.removeEventListener('mouseout', onExit)
    }
  }, [pathname, kind])

  const dismiss = useCallback(() => {
    setOpen(false)
    remember(Date.now() + MUTE_MS)
  }, [])

  const convert = useCallback(() => {
    setOpen(false)
    remember('never')
  }, [])

  return { kind, open, dismiss, convert }
}
