'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Lock, Pencil, X } from 'lucide-react'
import { saveContact } from '@/app/[locale]/contact/actions'
import { lockCareers } from '@/app/[locale]/careers/actions'
import type { ContactSettings as Settings } from '@/lib/contact-settings'

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
            try {
              await saveContact(formData)
              ref.current?.close()
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
              hint="Shown as typed. The dialer link strips the spaces."
              defaultValue={settings.phoneDisplay}
            />
            <Row name="email" label="Email" hint="Used for the mailto: link." defaultValue={settings.email} />
            <Row
              name="whatsapp"
              label="Sales WhatsApp"
              hint="Where the enquiry and demo forms send. Country code, no +."
              defaultValue={settings.whatsapp}
            />
          </div>

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

function Row({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string
  label: string
  hint: string
  defaultValue: string
}) {
  return (
    <div>
      <label htmlFor={`cs-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={`cs-${name}`}
        name={name}
        defaultValue={defaultValue}
        dir="ltr"
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
      <p className="mt-1.5 text-xs text-slate-faint">{hint}</p>
    </div>
  )
}
