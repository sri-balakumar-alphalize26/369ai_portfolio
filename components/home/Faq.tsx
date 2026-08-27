'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { FAQ_CATS, type FaqCatKey } from '@/content/faq'
import { cn } from '@/lib/cn'

/**
 * Category sidebar + accordion (the habsy.ai FAQ pattern): headings live in
 * a white card on the left, the active category's questions accordion on the
 * right. On mobile the sidebar becomes a horizontal chip row. Switching
 * categories remounts the list (key={cat}) so the faq-swap entrance replays.
 */
export function Faq() {
  const t = useTranslations('faq')
  const [cat, setCat] = useState<FaqCatKey>('general')
  const [open, setOpen] = useState<number | null>(1)

  const active = FAQ_CATS.find((c) => c.key === cat) ?? FAQ_CATS[0]

  function pick(next: FaqCatKey) {
    setCat(next)
    setOpen(1)
  }

  const catButton = (key: FaqCatKey, chip: boolean) => (
    <button
      key={key}
      type="button"
      onClick={() => pick(key)}
      aria-current={cat === key || undefined}
      className={cn(
        chip
          ? 'shrink-0 whitespace-nowrap rounded-pill border px-4 py-2 text-sm transition-colors'
          : 'block w-full rounded-lg px-4 py-2.5 text-start text-[0.95rem] transition-colors',
        cat === key
          ? chip
            ? 'border-brand-500 bg-brand-50 font-semibold text-brand-600'
            : 'bg-brand-50 font-semibold text-brand-600'
          : chip
            ? 'border-surface-line text-ink hover:border-brand-300 hover:text-brand-600'
            : 'text-ink hover:bg-brand-50/60 hover:text-brand-600'
      )}
    >
      {t(`cats.${key}.title`)}
    </button>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Mobile: horizontal chip row */}
      <nav
        aria-label={t('categoriesLabel')}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden"
      >
        {FAQ_CATS.map(({ key }) => catButton(key, true))}
      </nav>

      {/* Desktop: the white sidebar card */}
      <nav
        aria-label={t('categoriesLabel')}
        className="hidden self-start rounded-panel border border-surface-line bg-white p-3 shadow-sm lg:sticky lg:top-28 lg:block"
      >
        <ul className="space-y-1">
          {FAQ_CATS.map(({ key }) => (
            <li key={key}>{catButton(key, false)}</li>
          ))}
        </ul>
      </nav>

      {/* Active category's questions — remounted per category so the swap
          entrance replays. */}
      <ul key={cat} className="faq-swap divide-y divide-surface-line border-y border-surface-line self-start">
        {Array.from({ length: active.count }, (_, i) => i + 1).map((n) => {
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
                    {t(`cats.${cat}.q${n}`)}
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
                    {t(`cats.${cat}.a${n}`)}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
