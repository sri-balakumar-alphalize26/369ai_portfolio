/**
 * Key parity across the message catalogs.
 *
 * next-intl does not fail on a missing key — i18n/request.ts falls back to the
 * last path segment, so an incomplete catalog renders "heroBody" on the page
 * instead of throwing. With 700+ keys per locale that is a bug you find in
 * production, from a screenshot, months later.
 *
 * en.json is the reference, and the catalogs are whatever is in messages/ —
 * read from disk rather than from i18n/routing.ts, which is TypeScript and
 * cannot be imported from a plain node script. A locale listed in routing.ts
 * with no catalog fails the build long before this script would, so the
 * directory is the honest source here.
 *
 * Run with `npm run check:i18n`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MESSAGES = join(ROOT, 'messages')
const REFERENCE = 'en'

/** Every leaf path, as 'nav.about' — objects are walked, values are leaves. */
function keysOf(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [prefix]
  return Object.entries(value).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k))
}

const load = (locale) => JSON.parse(readFileSync(join(MESSAGES, `${locale}.json`), 'utf8'))

const locales = readdirSync(MESSAGES)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5))
  .sort((a, b) => (a === REFERENCE ? -1 : b === REFERENCE ? 1 : a.localeCompare(b)))

const reference = keysOf(load(REFERENCE)).sort()
const referenceSet = new Set(reference)

let failed = false
for (const locale of locales) {
  const keys = keysOf(load(locale)).sort()
  const set = new Set(keys)
  const missing = reference.filter((k) => !set.has(k))
  const extra = keys.filter((k) => !referenceSet.has(k))
  const show = (label, list) =>
    console.error(`  ${label} (${list.length}): ${list.slice(0, 15).join(', ')}${list.length > 15 ? ' …' : ''}`)

  if (missing.length || extra.length) {
    failed = true
    console.error(`\n${locale}.json  ${keys.length} keys  FAIL`)
    if (missing.length) show('missing', missing)
    if (extra.length) show('extra  ', extra)
  } else {
    console.log(`${locale}.json  ${keys.length} keys  ok`)
  }
}

if (failed) {
  console.error('\nCatalogs are out of sync with en.json.')
  process.exit(1)
}
console.log(`\nAll ${locales.length} catalogs match en.json (${reference.length} keys).`)
