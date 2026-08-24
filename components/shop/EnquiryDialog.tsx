'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { submitInquiry, validateInquiry, type InquiryPayload } from '@/lib/submit-inquiry'
import { cn } from '@/lib/cn'

type Errors = Partial<Record<keyof InquiryPayload, string>>

/**
 * "Enquire about this product" — asks the visitor for their details with the
 * product pre-filled. There is deliberately no quantity control and no basket:
 * one product, one enquiry.
 */
export function EnquiryDialog({
  product,
  open,
  onClose,
}: {
  product: string
  open: boolean
  onClose: () => void
}) {
  const t = useTranslations('contact.form')
  const ti = useTranslations('inquiry')
  const panelRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})

  // Escape to close, and lock the page behind the dialog.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    firstFieldRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Reset when reopened for another product — render-phase adjustment
  // keyed on (open, product), per React's reset-on-prop-change pattern.
  const dialogKey = open ? product : null
  const [prevKey, setPrevKey] = useState<string | null>(dialogKey)
  if (prevKey !== dialogKey) {
    setPrevKey(dialogKey)
    if (open) {
      setStatus('idle')
      setErrors({})
    }
  }

  if (!open) return null

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const payload: InquiryPayload = {
      product,
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      company: String(data.get('company') ?? ''),
      message: String(data.get('message') ?? ''),
    }

    const found = validateInquiry(payload)
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus('sending')
    const result = await submitInquiry(payload)
    setStatus(result.ok ? 'sent' : 'error')
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${ti('title')} — ${product}`}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-panel bg-white shadow-2xl sm:rounded-panel"
        style={{ animation: 'word-rise .35s var(--ease-out-soft) both' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-line bg-surface-alt px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">{ti('dialogTitle')}</h2>
            <p className="mt-1 text-sm text-slate-muted">{product}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ti('close')}
            className="rounded p-1.5 text-slate-muted transition-colors hover:bg-white hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" aria-hidden />
            <h3 className="mt-4 text-xl font-bold">{ti('successTitle')}</h3>
            <p className="mt-2 text-slate-muted">{ti('successBody')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white"
            >
              {ti('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            <Field
              ref={firstFieldRef}
              name="name"
              label={t('name')}
              required
              error={errors.name ? t('required') : undefined}
            />
            <Field
              name="email"
              type="email"
              label={t('email')}
              required
              error={
                errors.email === 'invalid'
                  ? t('invalidEmail')
                  : errors.email
                    ? t('required')
                    : undefined
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="phone" type="tel" label={t('phone')} />
              <Field name="company" label={t('company')} />
            </div>

            <div>
              <label htmlFor="enq-message" className="mb-1.5 block text-sm font-medium text-ink">
                {t('message')} <span className="text-accent-600">*</span>
              </label>
              <textarea
                id="enq-message"
                name="message"
                rows={4}
                className={cn(
                  'w-full rounded-card border px-4 py-2.5 text-sm outline-none transition-colors',
                  errors.message
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-surface-line focus:border-brand-400'
                )}
              />
              {errors.message ? (
                <p className="mt-1.5 text-xs text-red-600">{t('required')}</p>
              ) : null}
            </div>

            {status === 'error' ? (
              <p className="flex items-start gap-2 rounded-card bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {ti('errorBody')}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {ti('submitting')}
                </>
              ) : (
                ti('submit')
              )}
            </button>

            <p className="text-center text-xs text-slate-faint">
              {ti('replyNote')}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  ref,
  name,
  label,
  type = 'text',
  required,
  error,
}: {
  ref?: React.Ref<HTMLInputElement>
  name: string
  label: string
  type?: string
  required?: boolean
  error?: string
}) {
  const id = `enq-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        className={cn(
          'h-11 w-full rounded-card border px-4 text-sm outline-none transition-colors',
          error ? 'border-red-400 focus:border-red-500' : 'border-surface-line focus:border-brand-400'
        )}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
