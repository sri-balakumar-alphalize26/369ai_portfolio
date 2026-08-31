'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { PRODUCTS, type Product, type Testimonial } from '@/content/testimonials'
import { readTestimonials, testimonialId, writeTestimonials } from './testimonials'
import { requireUnlocked } from './careers-auth'

/**
 * Reviews. A visitor writes one and it is SAVED but not shown: `active` is
 * false until the owner switches it on in manage mode.
 *
 * That gate is the whole design. A form that published straight to the page
 * would let anyone on the internet put anything under the company's name —
 * abuse, spam, a competitor's copy — and a review wall anyone can write to is
 * worth nothing to the people reading it.
 */

const MAX = { name: 80, role: 80, company: 120, quote: 600 }

/** Trim, cap, and drop control characters. React escapes on render anyway. */
function clean(value: FormDataEntryValue | null, limit: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, limit)
}

/** Six a day per address: enough for a real customer, not for a script. */
const recent = new Map<string, number[]>()
function rateLimited(ip: string, now: number): boolean {
  const window = 24 * 60 * 60 * 1000
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < window)
  hits.push(now)
  recent.set(ip, hits)
  if (recent.size > 500) {
    for (const [key, times] of recent) {
      if (!times.some((t) => now - t < window)) recent.delete(key)
    }
  }
  return hits.length > 6
}

export type SubmitOutcome = 'ok' | 'invalid' | 'rate' | 'error'

/** The one action a visitor may call. Saved hidden, never published here. */
export async function submitTestimonial(formData: FormData): Promise<SubmitOutcome> {
  const now = Date.now()
  const head = await headers()
  const ip = (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local'
  if (rateLimited(ip, now)) return 'rate'

  const name = clean(formData.get('name'), MAX.name)
  const quote = clean(formData.get('quote'), MAX.quote)
  const rating = Number(formData.get('rating'))
  const product = String(formData.get('product') ?? '') as Product

  if (!name || quote.length < 10) return 'invalid'
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'invalid'
  if (!PRODUCTS.includes(product)) return 'invalid'

  try {
    const all = await readTestimonials()
    const stored = all.filter((entry) => !entry.sample)
    await writeTestimonials([
      ...stored,
      {
        id: testimonialId(name, stored.map((entry) => entry.id)),
        name,
        company: clean(formData.get('company'), MAX.company) || undefined,
        product,
        rating: rating as Testimonial['rating'],
        quote,
        // Hidden until the owner approves it. This is the moderation gate.
        active: false,
        order: (stored.at(-1)?.order ?? 0) + 1,
      },
    ])
  } catch (error) {
    console.error('[testimonials] could not store the review:', error)
    return 'error'
  }

  revalidatePath('/', 'layout')
  return 'ok'
}

/* ---- Owner-only. requireUnlocked() throws before anything reaches disk. ---- */

export async function saveTestimonial(formData: FormData): Promise<void> {
  await requireUnlocked()

  const name = clean(formData.get('name'), MAX.name)
  if (!name) throw new Error('name required')

  const all = (await readTestimonials()).filter((entry) => !entry.sample)
  const id = clean(formData.get('id'), 120)
  const current = all.find((entry) => entry.id === id)

  const entry: Testimonial = {
    id: current?.id ?? testimonialId(name, all.map((e) => e.id)),
    name,
    role: clean(formData.get('role'), MAX.role) || undefined,
    company: clean(formData.get('company'), MAX.company) || undefined,
    product: (PRODUCTS.includes(String(formData.get('product')) as Product)
      ? String(formData.get('product'))
      : 'software') as Product,
    rating: (Math.min(5, Math.max(1, Number(formData.get('rating')) || 5)) as Testimonial['rating']),
    quote: clean(formData.get('quote'), MAX.quote),
    active: formData.get('active') !== null,
    order: current?.order ?? (all.at(-1)?.order ?? 0) + 1,
  }

  await writeTestimonials(
    current ? all.map((e) => (e.id === entry.id ? entry : e)) : [...all, entry]
  )
  revalidatePath('/', 'layout')
}

export async function toggleTestimonial(id: string): Promise<void> {
  await requireUnlocked()
  const all = (await readTestimonials()).filter((entry) => !entry.sample)
  await writeTestimonials(
    all.map((entry) => (entry.id === id ? { ...entry, active: !entry.active } : entry))
  )
  revalidatePath('/', 'layout')
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requireUnlocked()
  const all = (await readTestimonials()).filter((entry) => !entry.sample)
  await writeTestimonials(all.filter((entry) => entry.id !== id))
  revalidatePath('/', 'layout')
}
