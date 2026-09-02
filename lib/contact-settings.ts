import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CONTACT } from '@/content/offices'
import { DATA_DIR } from '@/lib/careers'

/**
 * The sales contact details, editable in manage mode.
 *
 * Same two-location idea as lib/careers.ts:
 *   content/offices.ts CONTACT   committed, the details as shipped
 *   <data>/contact.json          written in manage mode, wins when it exists
 *
 * Only what a human types is stored. The machine-readable forms are derived on
 * read, so there is no second field to keep in sync and nothing to rot when
 * somebody edits the pretty number:
 *
 *   telHref   digits and a leading + only  — the dialer link
 *   waNumber  digits only                  — the format wa.me requires
 *
 * Both rules are the ones the Global Seas Trust enquiry page uses
 * (ContactCards.astro:91).
 *
 * WhatsApp used to be a third stored field. It is now derived from the same
 * phone number, because the two were always the same line and keeping them
 * apart only created a way for them to disagree: edit the number, forget the
 * WhatsApp box, and every enquiry form quietly keeps sending to the old one.
 * If sales ever needs a genuinely separate WhatsApp line, add the field back
 * here rather than asking editors to type the number twice.
 */
export type ContactSettings = {
  /** As shown to a visitor, spaces and all: '+91 70252 05503'. */
  phoneDisplay: string
  email: string
}

const FILE = join(DATA_DIR, 'contact.json')

const SEED: ContactSettings = {
  phoneDisplay: CONTACT.phoneDisplay,
  email: CONTACT.email,
}

function normalise(input: unknown): ContactSettings | null {
  if (!input || typeof input !== 'object') return null
  const data = input as Partial<ContactSettings>
  const phoneDisplay = String(data.phoneDisplay ?? '').trim()
  const email = String(data.email ?? '').trim()
  // A blank field would render a dead tel:/mailto:, so fall back per field
  // rather than throwing the whole file away. A file written before WhatsApp
  // became derived may still carry that key; it is simply ignored.
  return {
    phoneDisplay: phoneDisplay || SEED.phoneDisplay,
    email: email || SEED.email,
  }
}

/** The live details, or the shipped ones when the file is missing or broken. */
export async function readContact(): Promise<ContactSettings> {
  try {
    const parsed = normalise(JSON.parse(await readFile(FILE, 'utf8')))
    if (parsed) return parsed
    console.warn('[contact] data/contact.json is not in the expected shape — using the seed')
  } catch (error) {
    // ENOENT before the first save is the normal case, not a problem.
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn('[contact] could not read data/contact.json — using the seed:', error)
    }
  }
  return SEED
}

export async function writeContact(data: ContactSettings): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

/** '+91 70252 05503' -> 'tel:+917025205503'. */
export function telHref(phoneDisplay: string): string {
  return `tel:${phoneDisplay.replace(/[^\d+]/g, '')}`
}

/** The mail app opens with a subject already filled, not a blank draft. */
export function mailtoHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}

/**
 * wa.me wants bare digits — no +, no spaces. Pass `phoneDisplay`: the call
 * number and the WhatsApp line are the same number, and this is what turns
 * '+91 70252 05503' into '917025205503'.
 */
export function waNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function waHref(phone: string, text?: string): string {
  const base = `https://wa.me/${waNumber(phone)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
