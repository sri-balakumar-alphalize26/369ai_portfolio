import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { MANAGE_COOKIE as COOKIE } from '@/lib/manage-cookie'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cookies, headers } from 'next/headers'
import { DATA_DIR } from './careers'

/**
 * The careers editing lock.
 *
 * The passcode is compared HERE, on the server, and every write re-checks the
 * session here too. The browser's "unlocked" state only decides which buttons
 * render — a passcode compared in the browser would ship inside the JavaScript
 * and the save actions could be called without ever visiting the page.
 *
 * WHERE THE PASSCODE LIVES
 *   data/careers-passcode.json   the real one, once it has been set on screen
 *   CAREERS_PASSCODE (.env.local) the FIRST-RUN value only
 *
 * The stored file wins the moment it exists, so after the first change on
 * screen the env var is never read again and its line can be deleted — do not
 * edit it expecting anything to happen. Only a scrypt hash is stored, never
 * the passcode itself, so a backup or a stolen disk still cannot log in.
 *
 * The session cookie is signed with that hash, so changing the passcode
 * invalidates every open session everywhere, immediately and for free.
 */


const AUTH_FILE = join(DATA_DIR, 'careers-passcode.json')

const DEFAULT_SESSION_HOURS = 1
const MIN_SESSION_HOURS = 1
const MAX_SESSION_HOURS = 72
// Four, at the owner's request. Short codes are weaker, which is why the
// five-attempts-a-minute throttle above matters more here than it would with
// a longer one.
export const MIN_PASSCODE_LENGTH = 4

type Stored = { salt: string; hash: string; updatedAt: string; sessionHours: number }

function envPasscode(): string | null {
  const value = process.env.CAREERS_PASSCODE
  return value && value.trim() ? value.trim() : null
}

async function readStored(): Promise<Stored | null> {
  try {
    const parsed = JSON.parse(await readFile(AUTH_FILE, 'utf8')) as Stored
    return parsed?.salt && parsed?.hash ? parsed : null
  } catch {
    return null // not set on screen yet — the env value is in charge
  }
}

async function writeStored(next: Stored): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(AUTH_FILE, JSON.stringify(next, null, 2) + '\n', 'utf8')
}

function hashOf(passcode: string, salt: string): string {
  return scryptSync(passcode, salt, 64).toString('hex')
}

function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** How long an unlock lasts. Owner-set; 1 hour until they say otherwise. */
export async function sessionHours(): Promise<number> {
  const stored = await readStored()
  const hours = stored?.sessionHours
  return typeof hours === 'number' && hours >= MIN_SESSION_HOURS && hours <= MAX_SESSION_HOURS
    ? hours
    : DEFAULT_SESSION_HOURS
}

/** What the cookie is signed with — the stored hash, or the bootstrap value. */
async function signingKey(): Promise<string | null> {
  const stored = await readStored()
  return stored ? stored.hash : envPasscode()
}

async function verifyPasscode(entered: string): Promise<boolean> {
  const attempt = entered.trim()
  if (!attempt) return false

  const stored = await readStored()
  if (stored) return sameString(hashOf(attempt, stored.salt), stored.hash)

  const env = envPasscode()
  return env ? sameString(attempt, env) : false
}

function sign(expiry: number, key: string): string {
  return createHmac('sha256', key).update(String(expiry)).digest('hex')
}

async function issue(expiry: number, key: string): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE, `${expiry}.${sign(expiry, key)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiry),
  })
}

export async function isUnlocked(): Promise<boolean> {
  const key = await signingKey()
  if (!key) return false

  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return false

  const [expiryRaw, signature] = raw.split('.')
  const expiry = Number(expiryRaw)
  if (!expiry || !signature || expiry < Date.now()) return false
  return sameString(signature, sign(expiry, key))
}

/** Every write action calls this before touching disk. */
export async function requireUnlocked(): Promise<void> {
  if (!(await isUnlocked())) throw new Error('locked')
}

/** Five attempts a minute per address — enough for a typo, not for a script. */
const attempts = new Map<string, number[]>()
function throttled(ip: string, now: number): boolean {
  const window = 60 * 1000
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < window)
  hits.push(now)
  attempts.set(ip, hits)
  if (attempts.size > 500) {
    for (const [key, times] of attempts) {
      if (!times.some((t) => now - t < window)) attempts.delete(key)
    }
  }
  return hits.length > 5
}

export type UnlockOutcome = 'ok' | 'wrong' | 'throttled' | 'unset'

export async function openSession(entered: string): Promise<UnlockOutcome> {
  const key = await signingKey()
  if (!key) return 'unset'

  const now = Date.now()
  const head = await headers()
  const ip = (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local'
  if (throttled(ip, now)) return 'throttled'

  if (!(await verifyPasscode(entered))) return 'wrong'

  await issue(now + (await sessionHours()) * 60 * 60 * 1000, key)
  return 'ok'
}

export async function closeSession(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}

export type ChangeOutcome = 'ok' | 'wrong-current' | 'too-short' | 'mismatch'

/**
 * Changing the passcode needs the CURRENT one, even from an unlocked screen:
 * otherwise anyone walking past a logged-in laptop could set a new code and
 * lock the owner out of their own page.
 */
export async function changePasscode(
  current: string,
  next: string,
  confirm: string
): Promise<ChangeOutcome> {
  if (!(await verifyPasscode(current))) return 'wrong-current'
  if (next.trim().length < MIN_PASSCODE_LENGTH) return 'too-short'
  if (next !== confirm) return 'mismatch'

  const salt = randomBytes(16).toString('hex')
  const hash = hashOf(next.trim(), salt)
  await writeStored({
    salt,
    hash,
    updatedAt: new Date().toISOString(),
    sessionHours: await sessionHours(),
  })

  // Re-issue for THIS browser only: the person making the change stays in,
  // every other device is signed out by the new signature.
  await issue(Date.now() + (await sessionHours()) * 60 * 60 * 1000, hash)
  return 'ok'
}

/** Set how long an unlock lasts, and apply it to the session in hand. */
export async function setSessionHours(hours: number): Promise<boolean> {
  if (!Number.isFinite(hours)) return false
  const wanted = Math.round(hours)
  if (wanted < MIN_SESSION_HOURS || wanted > MAX_SESSION_HOURS) return false

  const stored = await readStored()
  if (stored) {
    await writeStored({ ...stored, sessionHours: wanted })
  } else {
    // Still on the bootstrap passcode: store the hash of it so the setting has
    // somewhere to live, without changing what the owner types.
    const env = envPasscode()
    if (!env) return false
    const salt = randomBytes(16).toString('hex')
    await writeStored({
      salt,
      hash: hashOf(env, salt),
      updatedAt: new Date().toISOString(),
      sessionHours: wanted,
    })
  }

  const key = await signingKey()
  if (key) await issue(Date.now() + wanted * 60 * 60 * 1000, key)
  return true
}
