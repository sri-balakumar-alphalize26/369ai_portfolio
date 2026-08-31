'use server'

import { randomBytes } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  APPLICATIONS_DIR,
  deleteApplication,
  readCareers,
  signCvToken,
  slugify,
  writeCareers,
  type Role,
} from '@/lib/careers'
import {
  changePasscode,
  closeSession,
  openSession,
  requireUnlocked,
  setSessionHours,
  type ChangeOutcome,
  type UnlockOutcome,
} from '@/lib/careers-auth'

/**
 * Receiving a job application. This is the one action a visitor may call, so
 * nothing the browser sends is trusted: every field is re-checked here, the
 * CV is verified to be a real PDF by its magic bytes (not by the `accept`
 * attribute or the reported MIME type, both of which are trivial to fake),
 * and the folder name is built from our own slug, never from user input.
 */

const MAX_BYTES = 1 * 1024 * 1024
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ApplyResult =
  | { ok: true; id: string; cvPath: string }
  | { ok: false; error: 'validation' | 'file' | 'rate' | 'server' }

/** Per-IP throttle. In-memory is right for a single Node process. */
const recent = new Map<string, number[]>()
function rateLimited(ip: string, now: number) {
  const window = 10 * 60 * 1000
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < window)
  hits.push(now)
  recent.set(ip, hits)
  if (recent.size > 500) for (const [k, v] of recent) if (!v.some((t) => now - t < window)) recent.delete(k)
  return hits.length > 5
}

export async function submitApplication(formData: FormData): Promise<ApplyResult> {
  const now = Date.now()
  const head = await headers()
  const ip = (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local'
  if (rateLimited(ip, now)) return { ok: false, error: 'rate' }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const roleId = String(formData.get('role') ?? '').trim()
  const cv = formData.get('cv')

  if (!name || !EMAIL.test(email) || !phone || !roleId) return { ok: false, error: 'validation' }

  // The role must be one we actually advertise (or the general application).
  const { roles } = await readCareers()
  const role = roles.find((r) => r.id === roleId && r.active)
  if (!role && roleId !== 'general') return { ok: false, error: 'validation' }
  const roleTitle = role?.title ?? 'General application'

  if (!(cv instanceof File) || cv.size === 0) return { ok: false, error: 'file' }
  if (cv.size > MAX_BYTES) return { ok: false, error: 'file' }

  const bytes = Buffer.from(await cv.arrayBuffer())
  // "%PDF-" — the only thing that actually proves it is a PDF.
  if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') return { ok: false, error: 'file' }

  // Best-effort shrink: re-saving with object streams deduplicates the
  // bloat Word/Docs exporters leave behind. It cannot re-encode images, so
  // photo-heavy CVs pass through nearly unchanged, and encrypted or quirky
  // PDFs throw — those are stored exactly as uploaded. The size guard keeps
  // the smaller of the two: pdf-lib can occasionally grow a tight file.
  let stored = bytes
  try {
    const doc = await PDFDocument.load(bytes)
    const packed = Buffer.from(await doc.save({ useObjectStreams: true }))
    if (packed.length < stored.length) stored = packed
  } catch {}

  const day = new Date(now).toISOString().slice(0, 10)
  const id = `${day}-${slugify(roleTitle)}-${randomBytes(3).toString('hex')}`

  try {
    const dir = join(APPLICATIONS_DIR, id)
    await mkdir(dir, { recursive: true })
    await writeFile(
      join(dir, 'application.json'),
      JSON.stringify(
        {
          id,
          submittedAt: new Date(now).toISOString(),
          role: roleTitle,
          roleId,
          name,
          email,
          phone,
          cv: 'cv.pdf',
          originalFilename: cv.name,
        },
        null,
        2
      ) + '\n',
      'utf8'
    )
    await writeFile(join(dir, 'cv.pdf'), stored)
  } catch (error) {
    console.error('[careers] could not store the application:', error)
    return { ok: false, error: 'server' }
  }

  const token = await signCvToken(id, now)
  return { ok: true, id, cvPath: `/api/cv/${id}?t=${token}` }
}

/* ------------------------------------------------------------------ *
 * Editing. Everything below is owner-only: requireUnlocked() throws
 * before anything reaches disk, and it checks the signed session
 * cookie on the server. The buttons in the browser are not the gate.
 * ------------------------------------------------------------------ */

/** One bullet per line, blanks dropped — the editor's textareas. */
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function text(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim()
}

/** Refresh the page AND the layout, so the Hiring badge follows the roles. */
function refresh() {
  revalidatePath('/', 'layout')
}

export async function unlockCareers(
  _previous: UnlockOutcome | null,
  formData: FormData
): Promise<UnlockOutcome> {
  const outcome = await openSession(String(formData.get('passcode') ?? ''))
  if (outcome === 'ok') refresh()
  return outcome
}

export async function lockCareers(): Promise<void> {
  await closeSession()
  refresh()
}

export async function saveRole(formData: FormData): Promise<void> {
  await requireUnlocked()

  const title = text(formData.get('title'))
  if (!title) throw new Error('title required')

  const data = await readCareers()
  const existingId = text(formData.get('id'))
  const current = data.roles.find((r) => r.id === existingId)

  // A new role takes its id from the title; a clash gets a numeric suffix so
  // two "Odoo Developer" postings can coexist.
  let id = existingId
  if (!current) {
    const base = slugify(title)
    id = base
    for (let n = 2; data.roles.some((r) => r.id === id); n += 1) id = `${base}-${n}`
  }

  const role: Role = {
    id,
    active: formData.get('active') !== null,
    order: current?.order ?? (data.roles.at(-1)?.order ?? 0) + 1,
    title,
    // Several office ticks plus the free box, joined with a middle dot —
    // the city names themselves contain commas.
    location:
      [...formData.getAll('location').map((v) => String(v).trim()), text(formData.get('locationOther'))]
        .filter(Boolean)
        .join(' · ') || undefined,
    summary: text(formData.get('summary')) || undefined,
    responsibilities: lines(formData.get('responsibilities')),
    requirements: lines(formData.get('requirements')),
    eligibility: lines(formData.get('eligibility')),
    jobType: text(formData.get('jobType')) || undefined,
    experience: text(formData.get('experience')) || undefined,
    workLocation: text(formData.get('workLocation')) || undefined,
    // First publication date, kept across edits — Google needs it and a
    // posting that keeps resetting to today reads as spam.
    postedAt: current?.postedAt ?? new Date().toISOString().slice(0, 10),
  }

  const roles = current
    ? data.roles.map((r) => (r.id === id ? role : r))
    : [...data.roles, role]

  await writeCareers({ ...data, roles })
  refresh()
}

export async function toggleRole(id: string): Promise<void> {
  await requireUnlocked()
  const data = await readCareers()
  await writeCareers({
    ...data,
    roles: data.roles.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
  })
  refresh()
}

export async function deleteRole(id: string): Promise<void> {
  await requireUnlocked()
  const data = await readCareers()
  await writeCareers({ ...data, roles: data.roles.filter((r) => r.id !== id) })
  refresh()
}

/** The destination number for applications, validated the same way as a CV. */
export async function saveWhatsapp(formData: FormData): Promise<void> {
  await requireUnlocked()
  const digits = text(formData.get('whatsapp')).replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) throw new Error('bad number')
  const data = await readCareers()
  await writeCareers({ ...data, whatsapp: digits })
  refresh()
}

export async function removeApplication(id: string): Promise<void> {
  await requireUnlocked()
  await deleteApplication(id)
  revalidatePath('/[locale]/careers/applications', 'page')
}

/**
 * The passcode and the session length, changed from the settings bar rather
 * than from a file. Both require an unlocked session; changing the passcode
 * additionally requires the current one — see lib/careers-auth.ts.
 */
export async function changeCareersPasscode(
  _previous: ChangeOutcome | null,
  formData: FormData
): Promise<ChangeOutcome> {
  await requireUnlocked()
  const outcome = await changePasscode(
    String(formData.get('current') ?? ''),
    String(formData.get('next') ?? ''),
    String(formData.get('confirm') ?? '')
  )
  if (outcome === 'ok') refresh()
  return outcome
}

export async function saveSessionHours(formData: FormData): Promise<void> {
  await requireUnlocked()
  const ok = await setSessionHours(Number(formData.get('hours')))
  if (!ok) throw new Error('bad session length')
  refresh()
}
