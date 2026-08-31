'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowRight,
  BriefcaseBusiness,
  Copy,
  Inbox,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { RevealGroup } from '@/components/ui/RevealGroup'
import type { Role } from '@/lib/careers'
import {
  deleteRole,
  lockCareers,
  saveSessionHours,
  saveWhatsapp,
  toggleRole,
} from '@/app/[locale]/careers/actions'
import { RoleDialog } from './RoleDialog'
import { RoleEditor } from './RoleEditor'
import { PhoneField } from './PhoneField'
import { PasscodeDialog } from './PasscodeDialog'

/**
 * The open roles, the dialog they open into, and — when the passcode session
 * is live — the controls for managing them. Cards reuse the /apps "What each
 * app does" treatment (.appd-card + .app-list), so no new CSS is needed.
 *
 * Every dialog stays mounted whether or not it is open: a closed <dialog> is
 * still in the DOM, so the job descriptions ship in the server-rendered HTML
 * and search engines can read them.
 *
 * `canEdit` only decides what renders. The passcode is checked on the server,
 * and every action below re-checks the session there before writing.
 */
export function CareersBoard({
  roles,
  whatsapp,
  canEdit = false,
  base,
  sessionHours = 1,
}: {
  roles: Role[]
  whatsapp: string
  canEdit?: boolean
  base: string
  /** How long an unlock lasts, so the box shows the real current value. */
  sessionHours?: number
}) {
  const t = useTranslations('careers')
  const [open, setOpen] = useState<{ id: string; pane: 'jd' | 'form' } | null>(null)
  const [editor, setEditor] = useState<{ role: Role | null; duplicate: boolean } | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [passcode, setPasscode] = useState(false)
  const [pending, startTransition] = useTransition()

  const shown = canEdit ? roles : roles.filter((role) => role.active)
  const applicable = roles.filter((role) => role.active)

  return (
    <>
      {canEdit ? (
        <div className="mt-10 rounded-panel border border-brand-200 bg-brand-50/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-brand-700">Editing — visitors do not see this</p>
            <div className="flex items-center gap-3">
              <Link
                href={`${base}/careers/applications`}
                className="inline-flex h-9 items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400"
              >
                <Inbox className="h-4 w-4" aria-hidden />
                Applications
              </Link>
              <button
                type="button"
                onClick={() => setPasscode(true)}
                className="inline-flex h-9 items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400"
              >
                <KeyRound className="h-4 w-4" aria-hidden />
                Change passcode
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => void lockCareers())}
                className="inline-flex h-9 items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400"
              >
                <Lock className="h-4 w-4" aria-hidden />
                Lock
              </button>
            </div>
          </div>

          <form
            action={saveWhatsapp}
            className="mt-5 flex flex-wrap items-end gap-3 border-t border-brand-200/70 pt-5"
          >
            <PhoneField
              name="whatsapp"
              label="Applications go to (WhatsApp)"
              invalidMessage="Enter a valid number for the selected country."
              defaultValue={whatsapp}
              className="w-full sm:w-80"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Save
            </button>
          </form>

          {/* How long an unlock lasts. Saving re-issues this browser's cookie,
              so a change applies now rather than at the next unlock. */}
          <form action={saveSessionHours} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="session-hours"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                Stay unlocked for (hours)
              </label>
              <input
                id="session-hours"
                name="hours"
                type="number"
                min={1}
                max={72}
                step={1}
                required
                defaultValue={sessionHours}
                className="h-11 w-28 rounded-xl border border-surface-line bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-pill border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400"
            >
              Save
            </button>
          </form>
        </div>
      ) : null}

      {shown.length ? (
        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-2">
          {shown.map((role, i) => (
            <li
              key={role.id}
              className="appd-card"
              style={{ '--d': `${Math.floor(i / 2) * 160}ms` } as React.CSSProperties}
            >
              <article
                className={`card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7 ${
                  role.active ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-card bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                    <BriefcaseBusiness className="h-5 w-5" aria-hidden />
                  </span>
                  {canEdit ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={role.active}
                      aria-label={`${role.title} — show on the site`}
                      disabled={pending}
                      onClick={() => startTransition(() => void toggleRole(role.id))}
                      className={`role-switch ${role.active ? 'is-on' : ''}`}
                    >
                      <span className="role-switch__dot" aria-hidden />
                    </button>
                  ) : null}
                </div>

                <h3 className="mt-5 text-xl font-bold">{role.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[role.location, role.jobType].filter(Boolean).map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
                    >
                      {chip}
                    </span>
                  ))}
                  {canEdit && !role.active ? (
                    <span className="inline-flex rounded-pill bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Closed
                    </span>
                  ) : null}
                </div>

                {role.summary ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-muted">
                    {role.summary.replace(/\*\*/g, '')}
                  </p>
                ) : null}

                {role.requirements?.length ? (
                  <ul className="app-list mt-5 space-y-2.5">
                    {role.requirements.slice(0, 3).map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-slate-body">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen({ id: role.id, pane: 'jd' })}
                    className="ms-link ms-link--site"
                  >
                    <span>{t('readMore')}</span>
                    <span className="ms-link__arrow" aria-hidden>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen({ id: role.id, pane: 'form' })}
                    className="inline-flex h-10 items-center justify-center rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03]"
                  >
                    {t('applyOpen')}
                  </button>
                </div>

                {canEdit ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-surface-line pt-4">
                    <EditButton onClick={() => setEditor({ role, duplicate: false })}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </EditButton>
                    <EditButton onClick={() => setEditor({ role, duplicate: true })}>
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      Duplicate
                    </EditButton>
                    {confirming === role.id ? (
                      <span className="ms-auto flex items-center gap-2 text-xs">
                        <span className="text-slate-muted">Delete?</span>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            setConfirming(null)
                            startTransition(() => void deleteRole(role.id))
                          }}
                          className="rounded-pill bg-red-600 px-3 py-1.5 font-semibold text-white"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="rounded-pill border border-surface-line px-3 py-1.5 font-medium"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <EditButton className="ms-auto" onClick={() => setConfirming(role.id)}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </EditButton>
                    )}
                  </div>
                ) : null}
              </article>
            </li>
          ))}

          {canEdit ? (
            <li className="appd-card">
              <button
                type="button"
                onClick={() => setEditor({ role: null, duplicate: false })}
                className="flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed border-brand-200 bg-white/60 text-brand-600 transition-colors hover:border-brand-400 hover:bg-white"
              >
                <Plus className="h-7 w-7" aria-hidden />
                <span className="text-sm font-semibold">Add role</span>
              </button>
            </li>
          ) : null}
        </RevealGroup>
      ) : (
        <div className="mt-12 rounded-panel border border-surface-line bg-white p-10 text-center">
          <h3 className="text-xl font-bold">{t('noRolesTitle')}</h3>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-muted">
            {t('noRolesBody')}
          </p>
          <button
            type="button"
            onClick={() => setOpen({ id: 'general', pane: 'form' })}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-pill bg-gradient-to-r from-accent-500 to-accent-400 px-6 text-[0.95rem] font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03]"
          >
            {t('form.submit')}
          </button>
        </div>
      )}

      {/* Mounted for every role, opened one at a time — see the note above. */}
      {shown.map((role) => (
        <RoleDialog
          key={role.id}
          role={role}
          roles={applicable}
          whatsapp={whatsapp}
          open={open?.id === role.id}
          startOn={open?.id === role.id ? open.pane : 'jd'}
          onClose={() => setOpen(null)}
        />
      ))}
      <RoleDialog
        role={null}
        roles={applicable}
        whatsapp={whatsapp}
        open={open?.id === 'general'}
        startOn="form"
        onClose={() => setOpen(null)}
      />

      {passcode ? <PasscodeDialog onClose={() => setPasscode(false)} /> : null}

      {editor ? (
        <RoleEditor
          role={editor.role}
          duplicate={editor.duplicate}
          onClose={() => setEditor(null)}
        />
      ) : null}
    </>
  )
}

function EditButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-pill border border-surface-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700 ${className}`}
    >
      {children}
    </button>
  )
}
