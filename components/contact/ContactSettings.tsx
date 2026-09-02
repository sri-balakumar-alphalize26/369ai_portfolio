'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Lock, Pencil, X } from 'lucide-react'
import { saveContact } from '@/app/[locale]/contact/actions'
import { lockCareers } from '@/app/[locale]/careers/actions'
import type { ContactSettings as Settings } from '@/lib/contact-settings'
import { emailProblem, EMAIL_MESSAGE } from '@/lib/email'

/**
 * Manage-mode editor for the sales contact details. Rendered only when the
 * page has already checked isUnlocked() on the server, and every save goes
 * through an action that re-checks — this component is convenience, not
 * security.
 *
 * English-only on purpose, like the careers editor: it is never shown to a
 * visitor, and seven translations for an owner-only dialog would be churn.
 */
export function ContactSettings({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)
  const [saving, setSaving] = useState(false)
  /* What the server refused, if it did. The browser catches these first, so
     this only shows when something got past it — but it must never close as
     though the save worked. */
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    const onClose = () => setOpen(false)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [open])

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-pill border border-surface-line bg-white px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit contact details
      </button>
        {/* Ends the session everywhere, not just this page. */}
        <button
          type="button"
          onClick={() => startTransition(() => void lockCareers())}
          className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Lock
        </button>
      </div>

      <dialog
        ref={ref}
        onClick={(event) => event.target === ref.current && ref.current?.close()}
        aria-label="Edit contact details"
        className="w-[min(30rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
      >
        <form
          action={async (formData) => {
            setSaving(true)
            setError(null)
            try {
              const result = await saveContact(formData)
              if (result.ok) ref.current?.close()
              else setError(result.error)
            } finally {
              setSaving(false)
            }
          }}
          className="p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">Contact details</h3>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <Row
              name="phoneDisplay"
              label="Phone"
              hint="Shown as typed, and used for calls and WhatsApp alike. The dialer and wa.me links strip the spaces themselves."
              defaultValue={settings.phoneDisplay}
            />
            <Row
              name="email"
              label="Email"
              type="email"
              required
              /* No `pattern`: an attribute cannot express a list of real domain
                 endings, and it was the reason .comm sailed through. The
                 callback runs the same emailProblem() the server does. */
              validate={(value) => {
                const problem = emailProblem(value)
                return problem ? EMAIL_MESSAGE[problem] : ''
              }}
              hint="Used for the mailto: link. Must be a full address with a real ending, like abc@gmail.com."
              defaultValue={settings.email}
            />
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-pill px-5 py-2.5 text-sm font-medium text-slate-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-pill bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

/**
 * One labelled field.
 *
 * Validation is the browser's: an invalid value blocks the submit and shows
 * `title` as the message, the same way the enquiry and careers forms work.
 * saveContact re-checks on the server regardless — this only means a typo is
 * caught while the dialog is still open, rather than being silently discarded
 * on save and leaving the old address in place with no explanation.
 */
function Row({
  name,
  label,
  hint,
  defaultValue,
  type = 'text',
  required,
  validate,
}: {
  name: string
  label: string
  hint: string
  defaultValue: string
  type?: string
  required?: boolean
  /** Returns a message to block the save with, or '' when the value is fine. */
  validate?: (value: string) => string
}) {
  /* setCustomValidity is what makes the browser refuse the submit and show the
     message. Re-run on every keystroke so the field clears itself as soon as
     the typo is corrected, rather than staying red until the next attempt. */
  const check = validate
    ? (event: { currentTarget: HTMLInputElement }) =>
        event.currentTarget.setCustomValidity(validate(event.currentTarget.value))
    : undefined

  return (
    <div>
      <label htmlFor={`cs-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={`cs-${name}`}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        onInput={check}
        dir="ltr"
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400 user-invalid:border-red-400"
      />
      <p className="mt-1.5 text-xs text-slate-faint">{hint}</p>
    </div>
  )
}
