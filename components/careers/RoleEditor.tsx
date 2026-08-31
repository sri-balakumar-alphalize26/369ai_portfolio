'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Role } from '@/lib/careers'
import { saveRole } from '@/app/[locale]/careers/actions'
import { RichArea } from './RichArea'

/**
 * The owner's editor for one job description. Deliberately in English and not
 * in the message catalogs: it is never shown to a visitor, and putting it in
 * seven files would mean seven-way churn for every wording tweak.
 *
 * The lists are plain textareas, one bullet per line, so a JD can be pasted
 * straight out of a document instead of typed bullet by bullet. Only the title
 * is required — an empty section simply does not render on the site.
 */
export function RoleEditor({
  role,
  duplicate = false,
  onClose,
}: {
  /** null = a brand new role. */
  role: Role | null
  /** Prefill from `role` but save as a new one. */
  duplicate?: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const onCancel = () => onClose()
    dialog.addEventListener('close', onCancel)
    return () => dialog.removeEventListener('close', onCancel)
  }, [onClose])

  const heading = !role ? 'Add a role' : duplicate ? `Duplicate — ${role.title}` : `Edit — ${role.title}`

  return (
    <dialog
      ref={ref}
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      aria-label={heading}
      className="w-[min(46rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <form
        action={async (formData) => {
          setSaving(true)
          try {
            await saveRole(formData)
            ref.current?.close()
          } finally {
            setSaving(false)
          }
        }}
        className="max-h-[85vh] overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold">{heading}</h3>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* A duplicate must not carry the original's id, or it would overwrite it. */}
        {role && !duplicate ? <input type="hidden" name="id" value={role.id} /> : null}

        <div className="mt-6 space-y-4">
          <Text name="title" label="Title" required defaultValue={role?.title} />

          <LocationPicker current={role?.location} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Select name="jobType" label="Job Type" defaultValue={role?.jobType} options={JOB_TYPES} />
            <Select
              name="experience"
              label="Experience"
              defaultValue={role?.experience}
              options={EXPERIENCE_BANDS}
            />
            <Select
              name="workLocation"
              label="Work Location"
              defaultValue={role?.workLocation}
              options={WORK_LOCATIONS}
            />
          </div>

          {/* Bold via a button and a live preview — nobody should have to
              know the ** markers exist (RichArea.tsx). */}
          <RichArea name="summary" label="Job Description" rows={4} defaultValue={role?.summary} />
          <Area
            name="responsibilities"
            label="Roles & Responsibilities"
            hint="One bullet per line."
            rows={6}
            defaultValue={role?.responsibilities?.join('\n')}
          />
          <Area
            name="requirements"
            label="Required Skills"
            hint="One bullet per line. The first three also show on the card."
            rows={6}
            defaultValue={role?.requirements?.join('\n')}
          />
          <Area
            name="eligibility"
            label="Eligibility"
            hint="One bullet per line."
            rows={4}
            defaultValue={role?.eligibility?.join('\n')}
          />

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              name="active"
              defaultChecked={role ? role.active : true}
              className="h-4 w-4 rounded border-surface-line accent-brand-500"
            />
            Show on the site
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="inline-flex h-11 items-center rounded-pill border border-surface-line px-5 text-sm font-medium text-ink transition-colors hover:border-brand-400"
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

/* The admin picks, not types: presets cover the normal cases, and a value
   saved back in the free-text era survives as its own injected option (see
   Select) rather than being silently dropped on the next save. */
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Temporary']
const EXPERIENCE_BANDS = ['Fresher', '0–1 years', '1–3 years', '2–4 years', '3–5 years', '5+ years']
const WORK_LOCATIONS = ['On-site', 'Remote', 'Hybrid']

/* Office cities from content/offices.ts. Role.location stays ONE string —
   saveRole joins the ticks (and the free box) with " · ", chosen because
   the city names themselves contain commas. */
const OFFICE_CITIES = ['Kollam, Kerala', 'Clearwater, Florida', 'Sharjah', 'Ruwi', 'Salalah', 'Sohar']

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string
  label: string
  defaultValue?: string
  options: string[]
}) {
  const opts = defaultValue && !options.includes(defaultValue) ? [defaultValue, ...options] : options
  return (
    <div>
      <label htmlFor={`role-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <select
        id={`role-${name}`}
        name={name}
        defaultValue={defaultValue ?? ''}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      >
        <option value="">—</option>
        {opts.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function LocationPicker({ current }: { current?: string }) {
  const parts = (current ?? '')
    .split(' · ')
    .map((part) => part.trim())
    .filter(Boolean)
  const other = parts.filter((part) => !OFFICE_CITIES.includes(part)).join(' · ')
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">Location</span>
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 rounded-xl border border-surface-line p-3.5">
        {OFFICE_CITIES.map((city) => (
          <label key={city} className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="location"
              value={city}
              defaultChecked={parts.includes(city)}
              className="h-4 w-4 rounded border-surface-line accent-brand-500"
            />
            {city}
          </label>
        ))}
        <input
          name="locationOther"
          defaultValue={other}
          placeholder="Anywhere else…"
          className="h-9 w-full rounded-lg border border-surface-line bg-white px-3 text-sm outline-none transition-colors focus:border-brand-400"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-faint">
        Tick every office this role hires in; the box below adds anywhere else.
      </p>
    </div>
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
      <label htmlFor={`role-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      <input
        id={`role-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
      />
    </div>
  )
}

function Area({
  name,
  label,
  hint,
  rows,
  defaultValue,
}: {
  name: string
  label: string
  hint: string
  rows: number
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={`role-${name}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <textarea
        id={`role-${name}`}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-surface-line bg-white p-3.5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-brand-400"
      />
      <p className="mt-1.5 text-xs text-slate-faint">{hint}</p>
    </div>
  )
}
