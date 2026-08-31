import { NextResponse, type NextRequest } from 'next/server'
import { MANAGE_COOKIE } from '@/lib/manage-cookie'

/**
 * The instant lock behind `?manage=0`.
 *
 * Locking means deleting the session cookie, and a page render is not allowed
 * to mutate cookies — only a server action, a route handler or the proxy can.
 * A route handler is used rather than the proxy because it hot-reloads in dev
 * and always runs, where the proxy needed a restart to pick up changes and
 * still did not fire for these paths.
 *
 * The lock is global by construction: one cookie at path '/' governs the
 * careers, home and contact editors, so clearing it locks all three at once,
 * whichever page the link was used on.
 *
 * No "is it already unlocked?" check on purpose — deleting an absent cookie is
 * a no-op, so a repeat visit, or a visitor who never had a session, simply
 * lands on the clean page. `manage=0` means "end up locked", not "toggle".
 */

/** Same-site paths only, so `next` can never bounce a visitor off-site. */
function safePath(next: string | null): string {
  if (!next || !next.startsWith('/')) return '/'
  // '//evil.com' and '/\evil.com' are protocol-relative URLs, not local paths.
  if (next.startsWith('//') || next.startsWith('/\\')) return '/'
  return next
}

export function GET(request: NextRequest) {
  const target = safePath(request.nextUrl.searchParams.get('next'))

  const response = NextResponse.redirect(new URL(target, request.nextUrl.origin))
  // The path must match how the session was issued (careers-auth issue():
  // path '/'), or the browser keeps the cookie and the lock does nothing.
  response.cookies.delete({ name: MANAGE_COOKIE, path: '/' })
  return response
}
