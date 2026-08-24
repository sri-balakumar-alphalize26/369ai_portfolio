'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'
import { Flag } from '@/components/ui/Flag'
import { locales, localeLabels, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'

/**
 * Region–language picker, following the HCLTech pattern: a visitor picks
 * "Oman & UAE — العربية", not a bare two-letter code.
 * Switching preserves the current path.
 */
export function LocaleSwitcher({
  tone = 'light',
  compact = false,
}: {
  tone?: 'dark' | 'light'
  /** Flag + chevron only — the region/language names move into the dropdown. */
  compact?: boolean
}) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Same hover intent as the mega-menu: quick to open, slow to close so the
  // pointer can travel down into the list without it snapping shut.
  function openOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpen(true), 80)
  }
  function closeOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function switchTo(next: Locale) {
    // pathname always starts with the current locale segment; swap it in place.
    const rest = pathname.replace(new RegExp(`^/${locale}`), '') || '/'
    setOpen(false)
    router.push(`/${next}${rest}`)
  }

  const current = localeLabels[locale]

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnHover}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors',
          compact && 'hover:bg-brand-50',
          tone === 'dark'
            ? 'text-slate-300 hover:text-white'
            : 'text-slate-body hover:text-brand-600'
        )}
      >
        <Flag locale={locale} className={compact ? "h-4 w-6" : "h-3 w-[1.15rem]"} />
        {compact ? null : (
          <>
            <span className="hidden sm:inline">
              {current.region} — {current.language}
            </span>
            <span className="sm:hidden">{current.language}</span>
          </>
        )}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="glass-panel absolute end-0 top-[calc(100%+1.75rem)] z-50 w-64 overflow-hidden rounded-2xl py-2"
          style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
        >
          {locales.map((l) => {
            const label = localeLabels[l]
            const active = l === locale
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchTo(l)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start text-sm transition-colors',
                    active
                      ? 'bg-brand-50/80 font-medium text-brand-700'
                      : 'text-slate-body hover:bg-white/70 hover:text-brand-700'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Flag locale={l} />
                    <span>
                      <span className="block text-[0.7rem] uppercase tracking-wide text-slate-faint">
                        {label.region}
                      </span>
                      <span>{label.language}</span>
                    </span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
