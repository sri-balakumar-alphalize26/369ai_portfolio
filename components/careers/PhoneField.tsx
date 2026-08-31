'use client'

import { useEffect, useId, useRef, useState } from 'react'
import 'intl-tel-input/styles'

/**
 * A phone box with a country dropdown and per-country validity rules, the same
 * treatment the Global Seas Trust enquiry form uses (intl-tel-input).
 *
 * Two inputs: the visible one the visitor types in, and a hidden one carrying
 * the full +E.164 number — never a bare national number, so a +91 and a +968
 * applicant can never be confused. Validity is reported through the visible
 * input's own `setCustomValidity`, so the form's `reportValidity()` handles it
 * natively; there is nothing for the parent to wire up.
 *
 * The library is imported lazily and retried once. If it never loads the box
 * stays a plain tel input and whatever was typed is still submitted — a failed
 * CDN must not cost someone a job application.
 */
export function PhoneField({
  name,
  label,
  placeholder,
  invalidMessage,
  required = true,
  defaultValue = '',
  className,
}: {
  name: string
  label: string
  placeholder?: string
  invalidMessage: string
  required?: boolean
  defaultValue?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenRef = useRef<HTMLInputElement>(null)
  const itiRef = useRef<{
    isValidNumber: () => boolean | null
    getNumber: () => string
    getSelectedCountryData: () => { dialCode?: string }
    destroy: () => void
  } | null>(null)
  const [invalid, setInvalid] = useState(false)
  const id = useId()
  const errorId = `${id}-error`

  useEffect(() => {
    const input = inputRef.current
    const hidden = hiddenRef.current
    if (!input || !hidden) return
    let disposed = false

    /** Keep the hidden field in international form whatever happens. */
    function sync() {
      if (!input || !hidden) return
      const typed = input.value.trim()
      if (!typed) {
        hidden.value = ''
        return
      }
      const iti = itiRef.current
      const full = iti?.getNumber() || ''
      if (full) {
        hidden.value = full
        return
      }
      const dial = iti?.getSelectedCountryData()?.dialCode
      hidden.value = dial ? `+${dial} ${typed}` : typed
    }

    function check(strict: boolean) {
      if (!input) return
      const iti = itiRef.current
      const typed = input.value.trim()
      sync()
      if (!iti) return input.setCustomValidity('')
      // While typing, only complain once the number is long enough to judge.
      const ok = typed === '' || iti.isValidNumber() === true
      const show = !ok && (strict || typed.replace(/\D/g, '').length >= 6)
      setInvalid(show)
      input.setCustomValidity(ok ? '' : invalidMessage)
    }

    const onInput = () => check(false)
    const onBlur = () => check(true)
    input.addEventListener('input', onInput)
    input.addEventListener('blur', onBlur)
    input.addEventListener('countrychange', onInput)

    const load = () =>
      import('intl-tel-input/intlTelInputWithUtils').then((m) => m.default)
    load()
      .catch(() => new Promise((r) => setTimeout(r, 400)).then(load))
      .then((factory) => {
        if (disposed || !factory || !input) return
        itiRef.current = factory(input, {
          initialCountry: 'in',
          separateDialCode: true,
          strictMode: true,
          // Where we have offices, then the neighbours people apply from.
          countryOrder: ['in', 'ae', 'om', 'us', 'qa', 'sa', 'gb'],
        }) as unknown as typeof itiRef.current
        if (input.value.trim()) check(false)
      })
      .catch(() => {
        console.warn('[careers] intl-tel-input did not load; phone left unvalidated')
      })

    return () => {
      disposed = true
      input.removeEventListener('input', onInput)
      input.removeEventListener('blur', onBlur)
      input.removeEventListener('countrychange', onInput)
      itiRef.current?.destroy()
      itiRef.current = null
    }
  }, [invalidMessage])

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} {required ? <span className="text-accent-600">*</span> : null}
      </label>
      {/* Display only — no `name`, so the national digits never post. */}
      <input
        ref={inputRef}
        id={id}
        type="tel"
        dir="ltr"
        autoComplete="tel"
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-describedby={invalid ? errorId : undefined}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-400 ${
          invalid ? 'border-red-400' : 'border-surface-line'
        }`}
      />
      <input ref={hiddenRef} type="hidden" name={name} />
      {invalid ? (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {invalidMessage}
        </p>
      ) : null}
    </div>
  )
}
