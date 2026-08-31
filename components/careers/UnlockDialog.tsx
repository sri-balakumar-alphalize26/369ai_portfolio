'use client'

import { useActionState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { unlockCareers } from '@/app/[locale]/careers/actions'
import type { UnlockOutcome } from '@/lib/careers-auth'
import { SecretField } from './SecretField'

const MESSAGES: Record<Exclude<UnlockOutcome, 'ok'>, string> = {
  wrong: 'That passcode is not right.',
  throttled: 'Too many attempts. Wait a minute and try again.',
  unset: 'No passcode is configured on the server (CAREERS_PASSCODE).',
}

/**
 * Reached only by /careers?manage=1 — nothing on the page points here. That is
 * tidiness, not security: the passcode is compared on the server, and every
 * write re-checks the session there too.
 */
export function UnlockDialog({ hours = 1 }: { hours?: number }) {
  const ref = useRef<HTMLDialogElement>(null)
  // The query string is what shows the editor, so it must survive a successful
  // unlock — and only a successful one.
  const succeeded = useRef(false)
  const router = useRouter()
  const pathname = usePathname()
  const [outcome, action, pending] = useActionState<UnlockOutcome | null, FormData>(
    unlockCareers,
    null
  )

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    // Cancelled: drop ?manage=1 so a refresh does not reopen the prompt.
    // Unlocked: keep it, or the editor would vanish the moment it appeared.
    const onClose = () => {
      if (!succeeded.current) router.replace(pathname)
    }
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [router, pathname])

  // A correct code re-renders the page unlocked (revalidatePath in the
  // action); the dialog's work is done.
  useEffect(() => {
    if (outcome !== 'ok') return
    succeeded.current = true
    ref.current?.close()
  }, [outcome])

  return (
    <dialog
      ref={ref}
      aria-label="Enter passcode"
      className="w-[min(24rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <form action={action} className="p-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-bold">Enter passcode</h3>
        <p className="mt-1.5 text-sm text-slate-muted">
          Unlocks editing for {hours} {hours === 1 ? 'hour' : 'hours'}, on this browser. The
          controls show while <code>?manage=1</code> is on the address — a plain /careers stays a
          visitor page.
        </p>

        <div className="mt-5">
          <SecretField name="passcode" label="Passcode" autoFocus />
        </div>
        {outcome && outcome !== 'ok' ? (
          <p className="mt-2 text-xs text-red-600">{MESSAGES[outcome]}</p>
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
            {pending ? 'Checking…' : 'Unlock'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
