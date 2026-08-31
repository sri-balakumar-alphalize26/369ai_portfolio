'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, CheckCircle2, MessageCircle, X } from 'lucide-react'
import type { Role } from '@/lib/careers'
import { submitApplication } from '@/app/[locale]/careers/actions'
import { PhoneField } from './PhoneField'

/**
 * The job description, and the application form behind it — one native
 * <dialog>, two panes. `showModal()` gives focus trapping, Escape and the
 * backdrop for free, which a div-with-a-portal would have to reimplement.
 */

type Pane = 'jd' | 'form' | 'done'

/** `**bold**` from the editor, rendered as <strong> — never as raw HTML. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function Bullets({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <section className="mt-6">
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      <ul className="jd-list mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-slate-body">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RoleDialog({
  role,
  roles,
  whatsapp,
  open,
  startOn,
  onClose,
}: {
  role: Role | null
  roles: Role[]
  whatsapp: string
  /** Kept mounted even when shut: a closed <dialog> still ships its content
      in the HTML, which is how the job description reaches search engines. */
  open: boolean
  startOn: Pane
  onClose: () => void
}) {
  const t = useTranslations('careers')
  const ref = useRef<HTMLDialogElement>(null)
  const [pane, setPane] = useState<Pane>(startOn)
  const [sending, setSending] = useState(false)
  const [fileError, setFileError] = useState(false)
  const [stored, setStored] = useState(true)
  const [chatUrl, setChatUrl] = useState('')

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onCancel = () => onClose()
    dialog.addEventListener('close', onCancel)
    return () => dialog.removeEventListener('close', onCancel)
  }, [onClose])

  // Reopening should start on the pane that was asked for. Done as a
  // render-phase adjustment (the React-endorsed "reset state on prop change"
  // pattern, as Header.tsx does), not an effect — no cascaded second render.
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) setPane(startOn)
  }

  function close() {
    ref.current?.close()
  }

  /** Click on the backdrop rather than the panel. */
  function onBackdrop(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current) close()
  }

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return setFileError(false)
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    setFileError(!isPdf)
    if (!isPdf) event.target.value = ''
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity() || sending) return

    const data = new FormData(form)
    const roleId = String(data.get('role') ?? '')
    const roleTitle = roles.find((r) => r.id === roleId)?.title ?? t('form.generalOption')

    // Opened DURING the click, so the browser still counts it as a user
    // gesture. It is navigated once the upload finishes — a wa.me URL cannot
    // be built before then, because it carries the CV link.
    const chat = window.open('', '_blank', 'noopener,noreferrer')

    setSending(true)
    const result = await submitApplication(data)
    setSending(false)

    const lines = [
      t('form.waIntro'),
      '',
      `${t('form.job')}: ${roleTitle}`,
      `${t('form.name')}: ${String(data.get('name') ?? '')}`,
      `${t('form.email')}: ${String(data.get('email') ?? '')}`,
      `${t('form.phone')}: ${String(data.get('phone') ?? '')}`,
    ]
    if (result.ok) lines.push('', `${t('form.cv')}: ${window.location.origin}${result.cvPath}`)

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
    setStored(result.ok)
    setChatUrl(url)
    if (chat) chat.location.href = url
    setPane('done')
    form.reset()
  }

  const heading =
    pane === 'form'
      ? t('applyTitle', { role: role?.title ?? t('form.generalOption') })
      : (role?.title ?? t('form.generalOption'))

  return (
    <dialog
      ref={ref}
      onClick={onBackdrop}
      aria-label={heading}
      className="w-[min(46rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold sm:text-2xl">{heading}</h3>
          <button
            type="button"
            onClick={close}
            aria-label={t('jd.close')}
            className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {pane === 'jd' && role ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {[role.location, role.jobType].filter(Boolean).map((chip) => (
                <span
                  key={chip}
                  className="inline-flex rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
                >
                  {chip}
                </span>
              ))}
            </div>

            {role.summary ? (
              <section className="mt-6">
                <h4 className="text-sm font-bold text-ink">{t('jd.heading')}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-body">
                  <RichText text={role.summary} />
                </p>
              </section>
            ) : null}

            <Bullets title={t('jd.responsibilities')} items={role.responsibilities} />
            <Bullets title={t('jd.requirements')} items={role.requirements} />
            <Bullets title={t('jd.eligibility')} items={role.eligibility} />

            <dl className="mt-7 space-y-1.5 border-t border-surface-line pt-5 text-sm">
              {[
                [t('jd.jobType'), role.jobType],
                [t('jd.experience'), role.experience],
                [t('jd.workLocation'), role.workLocation],
              ]
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label} className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold text-ink">{label}:</dt>
                    <dd className="text-slate-body">{value}</dd>
                  </div>
                ))}
            </dl>

            <button
              type="button"
              onClick={() => setPane('form')}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 text-[0.95rem] font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03]"
            >
              {t('applyOpen')}
            </button>
          </>
        ) : null}

        {pane === 'form' ? (
          <form onSubmit={onSubmit} noValidate={false} className="mt-6 space-y-4">
            <Field name="name" label={t('form.name')} placeholder={t('form.namePh')} />
            <Field
              name="email"
              type="email"
              label={t('form.email')}
              placeholder={t('form.emailPh')}
            />
            <PhoneField
              name="phone"
              label={t('form.phone')}
              placeholder={t('form.phonePh')}
              invalidMessage={t('form.phoneError')}
            />

            <div>
              <label
                htmlFor="apply-role"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                {t('form.job')} <span className="text-accent-600">*</span>
              </label>
              <select
                id="apply-role"
                name="role"
                required
                defaultValue={role?.id ?? ''}
                className="h-11 w-full rounded-xl border border-surface-line bg-white px-3 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
              >
                <option value="" disabled>
                  {t('form.jobPlaceholder')}
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
                <option value="general">{t('form.generalOption')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="apply-cv" className="mb-1.5 block text-sm font-medium text-ink-soft">
                {t('form.cv')} <span className="text-accent-600">*</span>
              </label>
              <input
                id="apply-cv"
                name="cv"
                type="file"
                required
                accept="application/pdf,.pdf"
                onChange={onPickFile}
                className="block w-full text-sm text-slate-body file:mr-3 file:rounded-pill file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
              <p className={`mt-1.5 text-xs ${fileError ? 'text-red-600' : 'text-slate-faint'}`}>
                {fileError ? t('form.fileError') : t('form.cvHint')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {role ? (
                <button
                  type="button"
                  onClick={() => setPane('jd')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  {t('jd.back')}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 text-[0.95rem] font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t('form.submit')}
              </button>
            </div>
          </form>
        ) : null}

        {pane === 'done' ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" aria-hidden />
            <p className="mt-4 text-[1.05rem] leading-relaxed text-slate-body">
              {stored ? t('form.done') : t('form.doneNoFile')}
            </p>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 text-[0.95rem] font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t('form.openChat')}
            </a>
          </div>
        ) : null}
      </div>
    </dialog>
  )
}

function Field({
  name,
  label,
  placeholder,
  type = 'text',
}: {
  name: string
  label: string
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={`apply-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} <span className="text-accent-600">*</span>
      </label>
      <input
        id={`apply-${name}`}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}
