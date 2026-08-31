'use client'

import { useActionState, useEffect, useRef } from 'react'
import { KeyRound, X } from 'lucide-react'
import { changeCareersPasscode } from '@/app/[locale]/careers/actions'
import type { ChangeOutcome } from '@/lib/careers-auth'
import { SecretField } from './SecretField'

const MESSAGES: Record<Exclude<ChangeOutcome, 'ok'>, string> = {
  'wrong-current': 'The current passcode is not right.',
  'too-short': 'The new passcode must be at least 4 characters.',
  mismatch: 'The two new passcodes do not match.',
}

/**
 * Changing the passcode from the screen. The current one is required even
 * though the session is already unlocked — otherwise anyone who walked past a
 * logged-in laptop could set a new code and lock the owner out.
 *
 * Saving signs this browser back in and signs every other device out, because
 * the session cookie is signed with the passcode hash.
 */
export function PasscodeDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [outcome, action, pending] = useActionState<ChangeOutcome | null, FormData>(
    changeCareersPasscode,
    null
  )

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const close = () => onClose()
    dialog.addEventListener('close', close)
    return () => dialog.removeEventListener('close', close)
  }, [onClose])

  useEffect(() => {
    if (outcome === 'ok') ref.current?.close()
  }, [outcome])

  return (
    <dialog
      ref={ref}
      aria-label="Change passcode"
      className="w-[min(26rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <form action={action} className="p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <h3 className="mt-4 text-lg font-bold">Change passcode</h3>
        <p className="mt-1.5 text-sm text-slate-muted">
          Every other device is signed out; this one stays in.
        </p>

        <div className="mt-5 space-y-3">
          <SecretField name="current" label="Current passcode" autoFocus />
          <SecretField name="next" label="New passcode" hint="At least 4 characters." />
          <SecretField name="confirm" label="Repeat the new passcode" />
        </div>

        {outcome && outcome !== 'ok' ? (
          <p className="mt-3 text-xs text-red-600">{MESSAGES[outcome]}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="inline-flex h-10 items-center rounded-pill border border-surface-line px-4 text-sm font-medium transition-colors hover:border-brand-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

