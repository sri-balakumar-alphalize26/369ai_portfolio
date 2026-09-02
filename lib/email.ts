/**
 * Email validation shared by the browser and the server.
 *
 * Its own module on purpose: the manage-mode editor is a client component and
 * lib/contact-settings.ts imports node:fs, so nothing in the browser can reach
 * the check if it lives there. Both layers calling the same function is what
 * stops them drifting apart.
 *
 * WHY THERE IS A LIST
 * The structural test alone — something, @, something, dot, something — cannot
 * catch `hr@alphalize.comm`. `comm` is shaped exactly like `photography`,
 * `technology` and `international`, which are all real endings, and real ones
 * run from two letters (`in`, `ae`, `om`) to long words. No length or pattern
 * rule separates the typo from the real thing, so the ending is compared
 * against endings that actually exist.
 *
 * The list is IANA's complete one (lib/tlds.ts), not a shortlist, so every real
 * domain is accepted — .in, .ae, .om, .io, .photography and the other 1,400 odd
 * — while .comm and .comdd are not. Only the LAST label is looked up, which is
 * what makes co.uk and co.in work without enumerating second-level pairs: `uk`
 * and `in` are what get checked.
 */
import { TLDS } from './tlds'

/** Something, @, something, dot, something — and no spaces anywhere. */
const SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type EmailProblem = 'shape' | 'tld'

/**
 * `null` when the address is usable.
 *
 * 'shape' — not an address at all: no @, no domain, a space in it, or empty.
 * 'tld'   — looks like an address, but the ending is not one that exists.
 */
export function emailProblem(value: string): EmailProblem | null {
  const email = value.trim()
  if (!SHAPE.test(email)) return 'shape'

  const tld = email.split('.').pop()?.toLowerCase() ?? ''
  return TLDS.has(tld) ? null : 'tld'
}

/** What to show someone who typed it. */
export const EMAIL_MESSAGE: Record<EmailProblem, string> = {
  shape: 'Enter a full address, like abc@gmail.com',
  tld: 'That domain ending does not look right — check for a typo, like .comm instead of .com',
}
