'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, CheckCircle2 } from 'lucide-react'
import { PhoneField } from '@/components/careers/PhoneField'

/**
 * "Enquire about this product" — asks the visitor for their details with the
 * product pre-filled. There is deliberately no quantity control and no basket:
 * one product, one enquiry.
 *
 * Delivery is the contact form's, deliberately: nothing is posted to us, the
 * answers are composed into a plain-text WhatsApp message and the visitor is
 * handed to WhatsApp with it already written. This replaced a server action
 * that validated the payload and then dropped it — the visitor was told the
 * enquiry had been received when nothing had been sent anywhere.
 *
 * The one line the contact form does not send: the product name, at the top,
 * so sales know what it is about before reading the rest.
 *
 * Validation is native (`noValidate` + `reportValidity()`), which is what
 * makes PhoneField's per-country rule bite — it reports through the input's
 * own setCustomValidity and needs the form to ask.
 */
export function EnquiryDialog({
  product,
  number,
  open,
  onClose,
}: {
  product: string
  /** Digits-only WhatsApp number, already normalised by waNumber(). */
  number: string
  open: boolean
  onClose: () => void
}) {
  const t = useTranslations('contact.form')
  const ti = useTranslations('inquiry')
  const panelRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [sent, setSent] = useState(false)

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
    if (open) setSent(false)
  }

  if (!open) return null

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const data = new FormData(form)
    const get = (key: string) => String(data.get(key) ?? '').trim()

    // Blank optional fields are dropped so sales never receives empty lines.
    const lines: string[] = [ti('waIntro'), '', `${ti('productLabel')}: ${product}`]
    for (const [key, label] of [
      ['name', t('name')],
      ['company', t('company')],
      ['email', t('email')],
      ['phone', t('phone')],
    ] as const) {
      const value = get(key)
      if (value) lines.push(`${label}: ${value}`)
    }
    const body = get('message')
    if (body) lines.push('', `${t('message')}:`, body)

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer'
    )
    setSent(true)
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

        {sent ? (
          /* Not "received" — the enquiry only reaches us when they press send
             in WhatsApp, so the panel says what actually happened. */
          <div className="px-6 py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" aria-hidden />
            <h3 className="mt-4 text-xl font-bold">{ti('openedTitle')}</h3>
            <p className="mt-2 text-slate-muted">{ti('sentHint')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white"
            >
              {ti('close')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={send}
            noValidate
            className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
          >
            <Field ref={firstFieldRef} name="name" label={t('name')} required />
            <Field name="email" type="email" label={t('email')} required />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Country dropdown + per-country validity; submits +E.164 in a
                  hidden input, so a +91 and a +968 enquiry cannot be confused. */}
              <PhoneField
                name="phone"
                label={t('phone')}
                invalidMessage={ti('phoneInvalid')}
                required={false}
              />
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
                required
                className="w-full rounded-card border border-surface-line px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-400"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02]"
            >
              {ti('submit')}
            </button>

            <p className="text-center text-xs text-slate-faint">{ti('replyNote')}</p>
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
}: {
  ref?: React.Ref<HTMLInputElement>
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  const id = `enq-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      {/* `required` reaches the input, not just the asterisk — the old version
          drew the star and left the field optional to the browser. */}
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-card border border-surface-line px-4 text-sm outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}
