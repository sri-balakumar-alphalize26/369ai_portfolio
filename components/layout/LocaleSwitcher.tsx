'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'
import { Flag } from '@/components/ui/Flag'
import { LogoLoader } from '@/components/ui/LogoLoader'
import { locales, localeLabels, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'

/**
 * Region–language picker, following the HCLTech pattern: a visitor picks
 * "Oman & UAE — العربية", not a bare two-letter code.
 * Switching preserves the current path.
 */
/**
 * The locales grouped by their region label, in `locales` order.
 *
 * India has three languages, so its region is printed once as a heading with
 * the flag beside it and the languages sit underneath. The flat alternative
 * put the word "India" on three consecutive rows, each with an identical
 * flag, which reads as a bug rather than a choice.
 *
 * Grouping is positional, not a lookup: a region breaks when the label
 * changes, so `locales` has to keep same-region entries adjacent — see the
 * note on that array in i18n/routing.ts.
 */
const REGIONS = locales.reduce<{ region: string; flag: Locale; items: Locale[] }[]>(
  (groups, l) => {
    const { region } = localeLabels[l]
    const last = groups[groups.length - 1]
    if (last?.region === region) last.items.push(l)
    else groups.push({ region, flag: l, items: [l] })
    return groups
  },
  []
)

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
  const tc = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
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
    // Inside a transition so isPending tracks the navigation — the spinner
    // overlay below stays up until the new locale's page has committed.
    startTransition(() => router.push(`/${next}${rest}`))
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
          /* max-h + scroll, not overflow-hidden: nine locales are taller than
             the gap between the header and the bottom of a phone viewport, and
             a clipped absolute panel cannot be scrolled to. Same treatment as
             SearchMenu. */
          className="glass-panel absolute end-0 top-[calc(100%+1.75rem)] z-50 max-h-[24rem] w-64 overflow-y-auto rounded-2xl py-2"
          style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
        >
          {REGIONS.map((group) => (
            <li key={group.region} role="group" aria-label={group.region}>
              <p className="flex items-center gap-3 px-4 pb-1 pt-2.5 text-[0.7rem] uppercase tracking-wide text-slate-faint">
                <Flag locale={group.flag} />
                {group.region}
              </p>
              <ul role="none">
                {group.items.map((l) => {
                  const active = l === locale
                  return (
                    <li key={l} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => switchTo(l)}
                        /* ps-[3.25rem] = px-4 + the flag's w-6 + gap-3, so the
                           language lines up under the region text above it. */
                        className={cn(
                          'flex w-full items-center justify-between gap-3 py-2 pe-4 ps-[3.25rem] text-start text-sm transition-colors',
                          active
                            ? 'bg-brand-50/80 font-medium text-brand-700'
                            : 'text-slate-body hover:bg-white/70 hover:text-brand-700'
                        )}
                      >
                        {localeLabels[l].language}
                        {active ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Language-switch feedback: brand spinner over a frosted page while the
          new locale streams in. Portaled to <body> — the header ancestors use
          transforms, which would otherwise turn position:fixed into
          position-relative-to-the-bar. Driven purely by isPending, so it
          clears itself the moment the navigation commits. */}
      {isPending
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              aria-label={tc('loading')}
              className="fixed inset-0 z-[95] grid place-items-center bg-surface-alt/70 backdrop-blur-sm"
            >
              <LogoLoader />
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
