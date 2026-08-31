'use client'

import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Send, Star, X } from 'lucide-react'
import { PRODUCTS } from '@/content/testimonials'
import { submitTestimonial, type SubmitOutcome } from '@/lib/testimonials-actions'

/**
 * "Share your experience" — saves straight to the site. No chat app in the
 * middle, and nothing published on the spot: the review is stored hidden and
 * appears only once the owner switches it on in manage mode.
 *
 * That is said plainly in the confirmation, so nobody refreshes the page
 * looking for words that are deliberately not there yet.
 */
export function ReviewDialog({
  onClose,
  defaultName = '',
  defaultProduct = '',
}: {
  onClose: () => void
  /** From ?name= — a convenience, never trusted: the server revalidates. */
  defaultName?: string
  defaultProduct?: string
}) {
  const t = useTranslations('home')
  const ref = useRef<HTMLDialogElement>(null)
  const [rating, setRating] = useState(0)
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null)
  const [pending, startTransition] = useTransition()

  function mount(node: HTMLDialogElement | null) {
    ref.current = node
    if (node && !node.open) {
      node.showModal()
      node.addEventListener('close', onClose, { once: true })
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity() || rating === 0 || pending) return

    const data = new FormData(form)
    data.set('rating', String(rating))
    startTransition(async () => setOutcome(await submitTestimonial(data)))
  }

  return (
    <dialog
      ref={mount}
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      aria-label={t('reviewTitle')}
      className="w-[min(30rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold">{t('reviewTitle')}</h3>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={t('reviewClose')}
            className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {outcome === 'ok' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" aria-hidden />
            <p className="mt-4 text-[1.05rem] leading-relaxed text-slate-body">{t('reviewDone')}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field name="name" label={t('reviewName')} required defaultValue={defaultName} />
            <Field name="company" label={t('reviewCompany')} />

            <div>
              <label
                htmlFor="review-product"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                {t('reviewProduct')} <span className="text-accent-600">*</span>
              </label>
              <select
                id="review-product"
                name="product"
                required
                defaultValue={defaultProduct}
                className="h-11 w-full rounded-xl border border-surface-line bg-white px-3 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
              >
                <option value="" disabled>
                  {t('reviewProduct')}
                </option>
                {PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {t(`products.${product}`)}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink-soft">
                {t('reviewRating')} <span className="text-accent-600">*</span>
              </legend>
              <div role="radiogroup" aria-label={t('reviewRating')} className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} / 5`}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 text-accent-500 transition-transform hover:scale-110"
                  >
                    <Star
                      className="h-7 w-7"
                      fill={value <= rating ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="review-quote"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                {t('reviewText')} <span className="text-accent-600">*</span>
              </label>
              <textarea
                id="review-quote"
                name="quote"
                rows={4}
                required
                minLength={10}
                maxLength={600}
                className="w-full rounded-xl border border-surface-line bg-white p-3.5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-brand-400"
              />
            </div>

            {outcome ? <p className="text-xs text-red-600">{t('reviewError')}</p> : null}

            <button
              type="submit"
              disabled={rating === 0 || pending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 text-[0.95rem] font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" aria-hidden />
              {t('reviewSend')}
            </button>
          </form>
        )}
      </div>
    </dialog>
  )
}

function Field({
  name,
  label,
  required = false,
  defaultValue,
}: {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={`review-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      <input
        id={`review-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        maxLength={120}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}
