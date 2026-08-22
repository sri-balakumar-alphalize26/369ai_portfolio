'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

const QUESTIONS = [1, 2, 3, 4, 5, 6] as const

export function Faq() {
  const t = useTranslations('faq')
  const [open, setOpen] = useState<number | null>(1)

  return (
    <ul className="divide-y divide-surface-line border-y border-surface-line">
      {QUESTIONS.map((n) => {
        const expanded = open === n
        return (
          <li key={n}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : n)}
                aria-expanded={expanded}
                className="flex w-full items-start justify-between gap-6 py-5 text-start"
              >
                <span
                  className={cn(
                    'text-base font-semibold transition-colors sm:text-lg',
                    expanded ? 'text-brand-600' : 'text-ink'
                  )}
                >
                  {t(`q${n}`)}
                </span>
                <Plus
                  className={cn(
                    'mt-1 h-5 w-5 shrink-0 text-slate-faint transition-transform duration-300',
                    expanded && 'rotate-45 text-brand-600'
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              className="grid transition-[grid-template-rows] duration-300"
              style={{
                gridTemplateRows: expanded ? '1fr' : '0fr',
                transitionTimingFunction: 'var(--ease-out-soft)',
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pe-11 text-[0.95rem] leading-relaxed text-slate-muted">
                  {t(`a${n}`)}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
