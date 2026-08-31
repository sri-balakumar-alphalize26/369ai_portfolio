/**
 * The name of the manage-mode session cookie.
 *
 * Its own module, with no imports, because proxy.ts needs it too and the proxy
 * docs warn against sharing modules with render code — importing it from
 * lib/careers-auth.ts would drag node:crypto and next/headers into the proxy
 * bundle. Keeping the literal in one place stops the two from drifting apart.
 */
export const MANAGE_COOKIE = 'careers_session'
