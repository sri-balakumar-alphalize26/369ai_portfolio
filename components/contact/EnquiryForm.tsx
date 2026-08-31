'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react'
import { PhoneField } from '@/components/careers/PhoneField'

/**
 * The enquiry form, ported from the Global Seas Trust site
 * (src/components/EnquiryForm.astro): the same five fields plus a message,
 * and the same delivery — nothing is posted to us, the answers are composed
 * into a plain-text WhatsApp message and the visitor is handed to WhatsApp
 * with it already written.
 *
 * That means an enquiry is never stored on the server. Whatever the visitor
 * types exists only in their own WhatsApp draft until they press send, so
 * abandoning the tab leaves nothing behind — the trade-off for having no
 * inbox to babysit.
 *
 * `number` is resolved on the server from data/contact.json, so the form
 * always opens the sales line that manage mode last saved, and `subject`
 * lets a page preset it (Products sends "Demo request").
 */
export function EnquiryForm({
  number,
  presetSubject,
}: {
  /** Digits-only WhatsApp number, already normalised by waNumber(). */
  number: string
  presetSubject?: string
}) {
  const t = useTranslations('contact.enquiry')
  const formRef = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const data = new FormData(form)
    const get = (key: string) => String(data.get(key) ?? '').trim()

    // Blank optional fields are dropped so sales never receives empty lines.
    const lines: string[] = [t('waIntro'), '']
    for (const [key, label] of [
      ['name', t('name')],
      ['company', t('company')],
      ['email', t('email')],
      ['phone', t('phone')],
      ['subject', t('subject')],
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
    <form ref={formRef} onSubmit={send} noValidate className="mt-10 grid gap-5 sm:grid-cols-2">
      <Field name="name" label={t('name')} placeholder={t('namePh')} required />
      <Field name="company" label={t('company')} placeholder={t('companyPh')} />
      <Field name="email" label={t('email')} placeholder={t('emailPh')} type="email" required />

      {/* Country dropdown + per-country validity; submits +E.164 in a hidden
          input, so a +91 and a +968 enquiry can never be confused. */}
      <PhoneField
        name="phone"
        label={t('phone')}
        placeholder={t('phonePh')}
        invalidMessage={t('phoneInvalid')}
        required={false}
      />

      <div className="sm:col-span-2">
        <Field
          name="subject"
          label={t('subject')}
          placeholder={t('subjectPh')}
          defaultValue={presetSubject}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="eq-message" className="mb-1.5 block text-sm font-medium text-ink-soft">
          {t('message')} <span className="text-accent-600">*</span>
        </label>
        <textarea
          id="eq-message"
          name="message"
          rows={6}
          required
          placeholder={t('messagePh')}
          className="w-full rounded-xl border border-surface-line bg-white p-3.5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-brand-400"
        />
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-pill bg-accent-500 px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-600"
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          {t('send')}
        </button>
        {/* WhatsApp opens in a new tab; if it was blocked, say so rather than
            leaving the visitor wondering whether anything happened. */}
        <p aria-live="polite" className="text-sm text-slate-muted">
          {sent ? t('sentHint') : null}
        </p>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  defaultValue,
}: {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={`eq-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      <input
        id={`eq-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}
