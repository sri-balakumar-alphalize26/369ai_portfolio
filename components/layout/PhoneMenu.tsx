'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Phone, ChevronDown } from 'lucide-react'
import { OFFICES, telHref } from '@/content/offices'
import { cn } from '@/lib/cn'

/** One row per number, so an office with two numbers appears twice. */
const NUMBERS = OFFICES.flatMap((office) =>
  (office.phones ?? []).map((phone) => ({
    key: `${office.id}-${phone}`,
    label: `${office.country} — ${office.city}`,
    phone,
  }))
)

/**
 * The header's phone icon, as a dropdown of every office number rather than a
 * single `tel:` link — a caller in Oman should not be dialling Sharjah.
 *
 * Same dropdown mechanics as LocaleSwitcher (local open state, outside-click,
 * Escape, 80ms-in / 180ms-out hover intent) so the header has one idiom, not two.
 */
export function PhoneMenu() {
  const t = useTranslations('footer')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  if (!NUMBERS.length) return null

  return (
    <div
      ref={wrapRef}
      className="relative hidden xl:block"
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnHover}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('contactUs')}
        className="flex h-9 items-center justify-center gap-1 rounded-xl px-2 text-slate-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
      >
        <Phone className="h-4 w-4" aria-hidden />
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="menu"
          className="glass-panel absolute end-0 top-[calc(100%+1.75rem)] z-50 w-64 overflow-hidden rounded-2xl py-2"
          style={{ animation: 'word-rise .28s var(--ease-out-soft) both' }}
        >
          {NUMBERS.map(({ key, label, phone }) => (
            <li key={key} role="none">
              <a
                role="menuitem"
                href={telHref(phone)}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 transition-colors hover:bg-brand-50"
              >
                <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-faint">
                  {label}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-ink">{phone}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
