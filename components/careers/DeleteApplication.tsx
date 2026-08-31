'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { removeApplication } from '@/app/[locale]/careers/actions'

/**
 * Deleting an application removes the CV with it, so the button asks first —
 * in place, rather than through a browser confirm() nobody reads.
 */
export function DeleteApplication({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-pill border border-surface-line px-3 py-1.5 text-xs font-medium text-slate-muted transition-colors hover:border-red-300 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>
    )
  }

  return (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-slate-muted">Delete this and the CV?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void removeApplication(id))}
        className="rounded-pill bg-red-600 px-3 py-1.5 font-semibold text-white disabled:opacity-60"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-pill border border-surface-line px-3 py-1.5 font-medium"
      >
        Cancel
      </button>
    </span>
  )
}
