import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import seed from '@/content/careers.seed.json'

/**
 * Careers storage. The site has no database and does not need one: the roles
 * are a single JSON file and each application is a folder holding a small JSON
 * and the CV.
 *
 * Two locations, deliberately:
 *   content/careers.seed.json  committed, the roles as shipped
 *   <data>/careers.json        written by the editor, wins when it exists
 *
 * So a fresh clone always has content, a deploy never wipes live edits, and a
 * corrupted write falls back to the seed rather than taking the page down.
 *
 * <data> is `./data` unless CAREERS_DATA_DIR says otherwise — on a real server
 * point it outside the app directory so a redeploy cannot delete applications.
 */

export type Role = {
  id: string
  active: boolean
  order: number
  title: string
  location?: string
  /** Intro paragraph. `**bold**` is rendered as <strong>, never as raw HTML. */
  summary?: string
  responsibilities?: string[]
  requirements?: string[]
  eligibility?: string[]
  jobType?: string
  experience?: string
  workLocation?: string
  /** ISO date the role was first published — required by Google for JobPosting. */
  postedAt?: string
}

export type CareersData = { whatsapp: string; roles: Role[] }

export const DATA_DIR = process.env.CAREERS_DATA_DIR || join(process.cwd(), 'data')
const ROLES_FILE = join(DATA_DIR, 'careers.json')
export const APPLICATIONS_DIR = join(DATA_DIR, 'applications')

function normalise(input: unknown): CareersData | null {
  if (!input || typeof input !== 'object') return null
  const data = input as Partial<CareersData>
  if (!Array.isArray(data.roles)) return null
  const roles = data.roles
    .filter((r): r is Role => !!r && typeof r === 'object' && typeof r.title === 'string')
    .map((r, i) => ({ ...r, active: r.active !== false, order: r.order ?? i + 1 }))
    .sort((a, b) => a.order - b.order)
  return { whatsapp: String(data.whatsapp || seed.whatsapp).replace(/\D/g, ''), roles }
}

/** The live list, or the seed when the file is missing, unreadable or broken. */
export async function readCareers(): Promise<CareersData> {
  try {
    const parsed = normalise(JSON.parse(await readFile(ROLES_FILE, 'utf8')))
    if (parsed) return parsed
    console.warn('[careers] data/careers.json is not in the expected shape — using the seed')
  } catch (error) {
    // ENOENT before the first save is the normal case, not a problem.
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn('[careers] could not read data/careers.json — using the seed:', error)
    }
  }
  return normalise(seed) as CareersData
}

/** Roles a visitor may see. */
export async function readActiveRoles(): Promise<Role[]> {
  return (await readCareers()).roles.filter((r) => r.active)
}

export async function writeCareers(data: CareersData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(ROLES_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

/**
 * Secret for signing CV download links. Kept in the data directory rather than
 * an env var so the feature works the moment it is deployed; generated once.
 */
async function downloadSecret(): Promise<string> {
  const file = join(DATA_DIR, '.cv-secret')
  try {
    const existing = (await readFile(file, 'utf8')).trim()
    if (existing) return existing
  } catch {
    // first use
  }
  const secret = randomBytes(32).toString('hex')
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(file, secret, 'utf8')
  return secret
}

const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** `<expiry>.<signature>` — enough to hand out in a WhatsApp message. */
export async function signCvToken(id: string, now: number): Promise<string> {
  const expiry = now + LINK_TTL_MS
  const secret = await downloadSecret()
  const signature = createHmac('sha256', secret).update(`${id}.${expiry}`).digest('hex')
  return `${expiry}.${signature}`
}

export async function verifyCvToken(id: string, token: string, now: number): Promise<boolean> {
  const [expiryRaw, signature] = String(token).split('.')
  const expiry = Number(expiryRaw)
  if (!expiry || !signature || expiry < now) return false
  const secret = await downloadSecret()
  const expected = createHmac('sha256', secret).update(`${id}.${expiry}`).digest('hex')
  const a = Buffer.from(signature, 'hex')
  const b = Buffer.from(expected, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Application folder ids are ours, but never trust one arriving in a URL. */
export function isSafeApplicationId(id: string): boolean {
  return /^[a-z0-9-]{8,120}$/.test(id)
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'role'
  )
}

export type Application = {
  id: string
  submittedAt: string
  role: string
  roleId: string
  name: string
  email: string
  phone: string
}

/**
 * The inbox. One folder per application; a folder that is missing its JSON or
 * has been hand-edited into nonsense is skipped rather than throwing, so one
 * bad record cannot hide all the others.
 */
export async function readApplications(): Promise<Application[]> {
  let entries: string[]
  try {
    entries = await readdir(APPLICATIONS_DIR)
  } catch {
    return [] // nothing has been received yet
  }

  const found = await Promise.all(
    entries.map(async (id) => {
      try {
        const raw = await readFile(join(APPLICATIONS_DIR, id, 'application.json'), 'utf8')
        const parsed = JSON.parse(raw) as Application
        return parsed?.name ? { ...parsed, id } : null
      } catch {
        return null
      }
    })
  )

  return found
    .filter((a): a is Application => a !== null)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

/** Remove one application and its CV — for when someone asks us to. */
export async function deleteApplication(id: string): Promise<void> {
  if (!isSafeApplicationId(id)) throw new Error('bad id')
  await rm(join(APPLICATIONS_DIR, id), { recursive: true, force: true })
}
