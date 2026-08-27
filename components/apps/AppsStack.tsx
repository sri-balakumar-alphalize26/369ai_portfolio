'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { MonitorCog, Check } from 'lucide-react'
import { AppIcon, type AppIconData } from './AppIcon'

type StackApp = AppIconData & { id: string }

const DESKTOP_POINTS = ['desktopF1', 'desktopF2', 'desktopF3'] as const

/**
 * The two scroll-stacking cards: Mobile Apps, then Desktop software sliding
 * over it. Layout is pure CSS position:sticky (globals.css .stack-card); this
 * component only measures how much of a card the next one has covered and
 * writes it to the --covered custom property, which CSS turns into a small
 * scale/brightness response. Transform and filter only — direction-agnostic,
 * so RTL needs no overrides. With JS off or reduced motion the cards still
 * stack; they just don't respond.
 */
export function AppsStack({ apps }: { apps: StackApp[] }) {
  const t = useTranslations('appsPage')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Same bail as the Header's scroll handler — under reduced motion the CSS
    // zeroes the response anyway; skipping the listener keeps scroll cheap.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('.stack-card') ?? []
    )
    if (cards.length < 2) return

    let frame = 0

    function measure() {
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i].getBoundingClientRect()
        const b = cards[i + 1].getBoundingClientRect()
        const covered = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height))
        cards[i].style.setProperty('--covered', covered.toFixed(3))
      }
    }

    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={rootRef} className="apps-stack">
      {/* Card 1 — the ten mobile apps */}
      <article className="stack-card rounded-panel border border-surface-line bg-white p-7 shadow-xl sm:p-10">
        <p className="inline-flex rounded-pill bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
          {t('mobileChip')}
        </p>
        <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{t('mobileTitle')}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-muted">{t('mobileBody')}</p>

        {/* Taglines hide below sm: — a sticky card taller than the viewport
            never gets covered, which kills the stacking read on phones. */}
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {apps.map((app) => (
            <li key={app.id}>
              <AppIcon app={app} className="h-12" />
              <h3 className="mt-3 text-sm font-bold text-ink">{app.name}</h3>
              <p className="mt-1 hidden text-xs leading-snug text-slate-muted sm:block">
                {t(`items.${app.id}.tagline`)}
              </p>
            </li>
          ))}
        </ul>
      </article>

      {/* Card 2 — Windows desktop software, dark so the slide-over reads */}
      <article className="stack-card relative overflow-hidden rounded-panel bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-7 text-brand-100 shadow-xl sm:p-10">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="inline-flex rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
            {t('desktopChip')}
          </p>
          <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-card bg-gradient-to-br from-accent-500 to-accent-400 text-white shadow-lg shadow-orange-500/25">
            <MonitorCog className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{t('desktopTitle')}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed">{t('desktopBody')}</p>

          <ul className="mt-7 grid gap-4 sm:grid-cols-3">
            {DESKTOP_POINTS.map((key) => (
              <li key={key} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3 text-accent-400" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed">{t(key)}</p>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}
