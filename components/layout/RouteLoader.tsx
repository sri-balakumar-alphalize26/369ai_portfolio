'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogoLoader } from '@/components/ui/LogoLoader'

/**
 * Site-wide navigation loader (owner request): every internal link click
 * shows the water-logo overlay, held for a minimum beat so the animation
 * registers even though prefetched pages commit near-instantly, then
 * hidden once the new route's pathname is live.
 *
 * Clicks are watched at the document level in the CAPTURE phase — Next's
 * <Link> preventDefault()s in its own handler to do client navigation, so
 * a bubble-phase listener that respects defaultPrevented would skip every
 * internal link. Capture runs first, while defaultPrevented is still
 * false. Query-/hash-only navigations are skipped — filters and anchors
 * have their own feedback. The locale switcher is a button, not a link,
 * and keeps its own identical overlay.
 *
 * Never sticks: hidden on pathname commit, and a failsafe hides it after
 * 5s no matter what (failed/cancelled navigations included).
 */

const MIN_VISIBLE_MS = 650
const FAILSAFE_MS = 5000
const SHOW_EVENT = 'route-loader:show'

/**
 * For programmatic navigations (router.push from a button, e.g. the search
 * menu) that the document click listener cannot see. Call just before the
 * push; no-ops when the target would not change the pathname, so the
 * overlay cannot be stranded waiting for a navigation that never commits.
 */
export function signalRouteLoading(href: string) {
  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return
    if (url.pathname === window.location.pathname) return
    window.dispatchEvent(new Event(SHOW_EVENT))
  } catch {
    /* malformed href — nothing to signal */
  }
}

export function RouteLoader() {
  const pathname = usePathname()
  const tc = useTranslations('common')
  const [visible, setVisible] = useState(false)
  const shownAt = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function show() {
      shownAt.current = Date.now()
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (failTimer.current) clearTimeout(failTimer.current)
      failTimer.current = setTimeout(() => setVisible(false), FAILSAFE_MS)
      setVisible(true)
    }
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]')
      if (!a) return
      if (a.getAttribute('target') === '_blank' || a.hasAttribute('download')) return
      let url: URL
      try {
        url = new URL(a.getAttribute('href') ?? '', window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return
      show()
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener(SHOW_EVENT, show)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener(SHOW_EVENT, show)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (failTimer.current) clearTimeout(failTimer.current)
    }
  }, [])

  // Hide once the navigation has committed, but never before the minimum
  // display time — an instant flash reads as a glitch, not a page load.
  const prevPath = useRef(pathname)
  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current))
    hideTimer.current = setTimeout(() => setVisible(false), wait)
  }, [pathname])

  if (!visible) return null
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label={tc('loading')}
      className="fixed inset-0 z-[95] grid place-items-center bg-surface-alt/70 backdrop-blur-sm"
    >
      <LogoLoader />
    </div>,
    document.body
  )
}
