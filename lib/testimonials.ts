import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DATA_DIR, slugify } from './careers'
import { SAMPLES, type Testimonial } from '@/content/testimonials'
import seed from '@/content/testimonials.seed.json'

/**
 * What clients say. Same storage shape as the careers roles, deliberately:
 * a JSON file the owner edits from the page, not from the codebase.
 *
 *   content/testimonials.ts         layout samples, development only
 *   content/testimonials.seed.json  the real ones, committed so a deploy
 *                                   carries them without carrying data/
 *   <data>/testimonials.json        the owner's own edits, which shadow
 *                                   the seed once anything is saved
 *
 * THE RULE, unchanged: nothing invented. Entries are what a customer actually
 * sent — over WhatsApp from the review form — added by the owner in manage
 * mode. Nothing a visitor submits is stored or published automatically, so
 * the page cannot be filled with anything the company did not vouch for.
 */

export type { Testimonial, Product } from '@/content/testimonials'

async function readFileOr<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn(`[testimonials] could not read ${file} — using the fallback:`, error)
    }
    return fallback
  }
}

const FILE = join(DATA_DIR, 'testimonials.json')

function normalise(list: unknown): Testimonial[] {
  if (!Array.isArray(list)) return []
  return list
    .filter(
      (entry): entry is Testimonial =>
        !!entry && typeof entry === 'object' && typeof (entry as Testimonial).name === 'string'
    )
    .map((entry, index) => ({
      ...entry,
      active: entry.active !== false,
      order: entry.order ?? index + 1,
      rating: (Math.min(5, Math.max(1, Number(entry.rating) || 5)) as Testimonial['rating']),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Everything stored, including the ones toggled off. THE OWNER VIEW, and
 * deliberately without the samples: manage mode must show what actually
 * exists, or it offers toggles over cards that cannot be toggled.
 */
export async function readTestimonials(): Promise<Testimonial[]> {
  return normalise((await readFileOr<{ testimonials?: unknown }>(FILE, seed)).testimonials)
}

/**
 * What a visitor may see. With nothing published yet the layout samples
 * stand in — in development only, so a production build shows the section
 * empty (and therefore not at all) rather than placeholders.
 */
export async function readPublishedTestimonials(): Promise<Testimonial[]> {
  const live = (await readTestimonials()).filter((entry) => entry.active)
  if (live.length) return live
  return process.env.NODE_ENV === 'production' ? [] : SAMPLES
}

export async function writeTestimonials(list: Testimonial[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE, JSON.stringify({ testimonials: list }, null, 2) + '\n', 'utf8')
}

/** An id from the customer's name, de-duplicated so two Rahuls can coexist. */
export function testimonialId(name: string, taken: string[]): string {
  const base = slugify(name)
  let id = base
  for (let n = 2; taken.includes(id); n += 1) id = `${base}-${n}`
  return id
}
