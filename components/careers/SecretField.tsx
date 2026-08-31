'use client'

import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * A passcode box with a show/hide eye. Typing a passcode blind is how a wrong
 * one gets entered three times in a row, so the toggle is worth the button.
 *
 * autoCapitalize/autoCorrect/spellCheck are off deliberately: a phone keyboard
 * capitalising the first letter turns a correct passcode into a wrong one.
 */
export function SecretField({
  name,
  label,
  hint,
  autoFocus = false,
}: {
  name: string
  label: string
  hint?: string
  autoFocus?: boolean
}) {
  const [shown, setShown] = useState(false)
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={shown ? 'text' : 'password'}
          required
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="h-11 w-full rounded-xl border border-surface-line bg-white ps-3.5 pe-11 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
        />
        <button
          type="button"
          onClick={() => setShown((was) => !was)}
          aria-label={shown ? 'Hide passcode' : 'Show passcode'}
          title={shown ? 'Hide passcode' : 'Show passcode'}
          className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-muted transition-colors hover:text-brand-600"
        >
          {shown ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {hint ? <p className="mt-1 text-xs text-slate-faint">{hint}</p> : null}
    </div>
  )
}
