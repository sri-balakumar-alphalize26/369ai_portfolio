'use client'

import { useEffect } from 'react'

/**
 * Forces a re-check when a manage page is restored from the browser's
 * back/forward cache.
 *
 * Locking clears the session cookie, but pressing Back can repaint the
 * previously rendered page straight from the bfcache without asking the server
 * anything — so the editor reappears after it was locked. Nothing is actually
 * editable (every action re-checks the session, and ?manage=1 without a cookie
 * renders the passcode prompt), but a dead screenshot of the editor should not
 * come back either.
 *
 * `event.persisted` is the flag that distinguishes a bfcache restore from a
 * normal load, so an ordinary first render never reloads — only the restore
 * does, and then the server decides what to show.
 *
 * Rendered only on pages carrying ?manage=1; visitor pages keep their caching.
 */
export function BfcacheGuard() {
  useEffect(() => {
    function onShow(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  return null
}
