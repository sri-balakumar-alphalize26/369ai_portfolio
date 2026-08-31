'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, X } from 'lucide-react'
import { PRODUCTS, type Testimonial } from '@/content/testimonials'
import { saveTestimonial } from '@/lib/testimonials-actions'

/**
 * The owner's editor for one review. English only and outside the message
 * catalogs, like the careers editor: no visitor ever sees it, and seven-way
 * churn for a wording tweak would be waste.
 *
 * Adding one by hand is the normal path — a customer sends words over
 * WhatsApp or in person, and they are entered here. What the form must never
 * become is a place to invent them.
 */
export function TestimonialEditor({
  entry,
  onClose,
}: {
  /** null = a new review. */
  entry: Testimonial | null
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [rating, setRating] = useState(entry?.rating ?? 5)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const close = () => onClose()
    dialog.addEventListener('close', close)
    return () => dialog.removeEventListener('close', close)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      aria-label={entry ? `Edit ${entry.name}` : 'Add a review'}
      className="w-[min(30rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <form
        action={async (formData) => {
          setSaving(true)
          try {
            formData.set('rating', String(rating))
            await saveTestimonial(formData)
            ref.current?.close()
          } finally {
            setSaving(false)
          }
        }}
        className="max-h-[85vh] overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold">{entry ? `Edit — ${entry.name}` : 'Add a review'}</h3>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}

        <div className="mt-6 space-y-4">
          <Text name="name" label="Name" required defaultValue={entry?.name} />
          <Text name="role" label="Role" defaultValue={entry?.role} placeholder="Operations Manager" />
          <Text
            name="company"
            label="Company"
            defaultValue={entry?.company}
            placeholder="Danat Technology, Sharjah"
          />

          <div>
            <label htmlFor="t-product" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Product
            </label>
            <select
              id="t-product"
              name="product"
              defaultValue={entry?.product ?? 'software'}
              className="h-11 w-full rounded-xl border border-surface-line bg-white px-3 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
            >
              {PRODUCTS.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink-soft">Rating</legend>
            <div role="radiogroup" aria-label="Rating" className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} / 5`}
                  onClick={() => setRating(value as Testimonial['rating'])}
                  className="rounded-lg p-1 text-accent-500 transition-transform hover:scale-110"
                >
                  <Star
                    className="h-6 w-6"
                    fill={value <= rating ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="t-quote" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Their words
            </label>
            <textarea
              id="t-quote"
              name="quote"
              rows={5}
              maxLength={600}
              defaultValue={entry?.quote}
              className="w-full rounded-xl border border-surface-line bg-white p-3.5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-brand-400"
            />
            <p className="mt-1.5 text-xs text-slate-faint">
              What the customer actually wrote. Tidy a typo; never write it for them.
            </p>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              name="active"
              defaultChecked={entry ? entry.active !== false : true}
              className="h-4 w-4 rounded border-surface-line accent-brand-500"
            />
            Show on the site
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="inline-flex h-11 items-center rounded-pill border border-surface-line px-5 text-sm font-medium transition-colors hover:border-brand-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

function Text({
  name,
  label,
  defaultValue,
  placeholder,
  required = false,
}: {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={`t-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      <input
        id={`t-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={120}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}
