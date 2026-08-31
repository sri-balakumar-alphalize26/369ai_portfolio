'use client'

import { useId, useRef, useState } from 'react'
import { Bold } from 'lucide-react'

/**
 * The Job Description box. It stores `**bold**` markers, but nobody editing a
 * job ad should have to know that — so there is a B button that wraps the
 * selected words (and unwraps them if they are already bold), plus a live
 * preview showing exactly what the popup will render.
 *
 * Uncontrolled on purpose: the form posts `textarea.value` as it always did,
 * and the preview is the only thing tracking state.
 */
export function RichArea({
  name,
  label,
  rows = 4,
  defaultValue = '',
}: {
  name: string
  label: string
  rows?: number
  defaultValue?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(defaultValue)
  const id = useId()

  function toggleBold() {
    const field = ref.current
    if (!field) return

    const { selectionStart: start, selectionEnd: end, value: text } = field
    const selected = text.slice(start, end)

    // Already wrapped? Take the markers off rather than doubling them.
    const wrappedInside = selected.startsWith('**') && selected.endsWith('**') && selected.length > 4
    const wrappedOutside = text.slice(start - 2, start) === '**' && text.slice(end, end + 2) === '**'

    let next: string
    let from: number
    let to: number

    if (wrappedInside) {
      const bare = selected.slice(2, -2)
      next = text.slice(0, start) + bare + text.slice(end)
      from = start
      to = start + bare.length
    } else if (wrappedOutside) {
      next = text.slice(0, start - 2) + selected + text.slice(end + 2)
      from = start - 2
      to = from + selected.length
    } else {
      // Nothing selected: drop the markers in and put the caret between them.
      next = `${text.slice(0, start)}**${selected}**${text.slice(end)}`
      from = start + 2
      to = from + selected.length
    }

    field.value = next
    setValue(next)
    field.focus()
    field.setSelectionRange(from, to)
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <button
          type="button"
          onClick={toggleBold}
          title="Bold the selected words"
          className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-surface-line px-3 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <Bold className="h-3.5 w-3.5" aria-hidden />
          Bold
        </button>
      </div>

      <textarea
        ref={ref}
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-xl border border-surface-line bg-white p-3.5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-brand-400"
      />

      <p className="mt-1.5 text-xs text-slate-faint">
        Select the words you want to stand out, then press <strong>Bold</strong>.
      </p>

      {value.trim() ? (
        <div className="mt-2 rounded-xl border border-surface-line bg-surface-alt p-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-faint">
            How it will look
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-body">
            {value.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i} className="font-semibold text-ink">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
      ) : null}
    </div>
  )
}
