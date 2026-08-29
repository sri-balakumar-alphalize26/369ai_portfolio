'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { MonitorCog, Check, Bot, Lock, Boxes, ArrowRight, type LucideIcon } from 'lucide-react'
import { AppIcon, type AppIconData } from './AppIcon'
import { SOLUTION_IMAGES } from '@/content/solutions'
import { useCardStack } from '@/lib/use-card-stack'
import { cn } from '@/lib/cn'

type StackApp = AppIconData & { id: string }

type SolutionCard = {
  key: 'robotics' | 'locks' | 'vending'
  Icon: LucideIcon
  tone: 'light' | 'dark'
  /** Photo under public/, or null to draw the brand-panel stand-in. */
  image: string | null
}

const DESKTOP_POINTS = ['desktopF1', 'desktopF2', 'desktopF3'] as const

/**
 * Solution cards reuse the `solutions` namespace copy (already in all seven
 * locales) and, where the hardware catalogue has a matching product photo,
 * that photo. Smart locks have no catalogue product yet, so that card draws
 * the solutions-page brand panel instead — set `image` to a file under
 * public/ (e.g. /images/apps/smart-lock.png) to swap a photo in.
 */
const SOLUTION_CARDS: SolutionCard[] = [
  { key: 'robotics', Icon: Bot, tone: 'light', image: SOLUTION_IMAGES.robotics ?? null },
  { key: 'locks', Icon: Lock, tone: 'dark', image: SOLUTION_IMAGES.locks ?? null },
  { key: 'vending', Icon: Boxes, tone: 'light', image: SOLUTION_IMAGES.vending ?? null },
]

/**
 * Five scroll-stacking cards: Mobile Apps, Desktop software, then Robotics,
 * Smart Locks and Vending — tones alternate light/dark so every slide-over
 * reads. Layout is pure CSS position:sticky (globals.css .stack-card); this
 * component equalizes the card heights (so no card peeks out beneath a
 * shorter one) and measures how deep each card sits in the pile, written to
 * the --depth custom property, which CSS turns into the deck: covered cards
 * step up, shrink and dim behind the front one. translate/scale/filter only —
 * direction-agnostic, so RTL needs no overrides. With JS off or reduced
 * motion the cards still stack; they just don't respond.
 */
export function AppsStack({
  apps,
  cta,
}: {
  apps: StackApp[]
  /** Optional link rendered inside the Mobile Apps card (home page → /apps). */
  cta?: { href: string; label: string }
}) {
  const t = useTranslations('appsPage')
  const ts = useTranslations('solutions')
  const tc = useTranslations('common')
  const base = `/${useLocale()}`
  const rootRef = useRef<HTMLDivElement>(null)

  useCardStack(rootRef)

  return (
    <div ref={rootRef} className="card-stack">
      {/* Card 1 — the ten mobile apps */}
      <article className="stack-card flex flex-col justify-center rounded-panel border border-surface-line bg-white p-7 shadow-xl sm:p-10">
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

        {cta ? (
          <Link
            href={cta.href}
            className="learn-more mt-8 inline-flex items-center gap-1.5 self-start rounded-pill border border-surface-line px-5 py-2.5 font-semibold text-brand-600 transition-colors"
          >
            <span>{cta.label}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        ) : null}
      </article>

      {/* Card 2 — Windows desktop software, dark so the slide-over reads */}
      <article className="stack-card relative flex flex-col justify-center overflow-hidden rounded-panel bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-7 text-brand-100 shadow-xl sm:p-10">
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

      {/* Cards 3–5 — Robotics, Smart Locks, Vending: text beside a picture.
          The image frame is height-capped on phones so the card stays short
          enough to be covered by the next one. */}
      {SOLUTION_CARDS.map(({ key, Icon, tone, image }) => {
        const dark = tone === 'dark'
        return (
          <article
            key={key}
            className={cn(
              'stack-card relative flex flex-col justify-center overflow-hidden rounded-panel p-7 shadow-xl sm:p-10',
              dark
                ? 'bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-brand-100'
                : 'border border-surface-line bg-white'
            )}
          >
            {dark ? (
              <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
            ) : null}
            <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-card text-white shadow-lg',
                    dark
                      ? 'bg-gradient-to-br from-accent-500 to-accent-400 shadow-orange-500/25'
                      : 'bg-gradient-to-br from-brand-700 to-brand-500 shadow-cyan-900/20'
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h2 className={cn('mt-4 text-2xl font-bold sm:text-3xl', dark && 'text-white')}>
                  {ts(`${key}.title`)}
                </h2>
                <p className={cn('mt-2 text-lg font-semibold', dark ? 'text-accent-400' : 'text-accent-600')}>
                  {ts(`${key}.tagline`)}
                </p>
                <p className={cn('mt-4 leading-relaxed', dark ? 'text-brand-100' : 'text-slate-muted')}>
                  {ts(`${key}.body`)}
                </p>
                <Link
                  href={`${base}/solutions#${key}`}
                  className={cn(
                    'mt-6 inline-flex items-center gap-1.5 rounded-pill border px-5 py-2.5 font-semibold transition-colors',
                    dark
                      ? 'border-white/20 text-white hover:bg-white/10'
                      : 'learn-more border-surface-line text-brand-600'
                  )}
                >
                  <span>{tc('learnMore')}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>

              {image ? (
                <div className="relative h-48 overflow-hidden rounded-panel bg-surface-alt sm:h-64 lg:aspect-[4/3] lg:h-auto">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-contain p-4"
                  />
                </div>
              ) : (
                /* Brand panel stand-in until a smart-lock photo is provided. */
                <div className="relative h-48 overflow-hidden rounded-panel bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 sm:h-64 lg:aspect-[4/3] lg:h-auto">
                  <div
                    aria-hidden
                    className="aurora-blob aurora-a absolute h-72 w-72 opacity-40"
                    style={{ top: '-4rem', insetInlineStart: '-3rem', background: '#30a8c0' }}
                  />
                  <div
                    aria-hidden
                    className="aurora-blob aurora-b absolute h-56 w-56 opacity-30"
                    style={{ bottom: '-3rem', insetInlineEnd: '-2rem', background: '#ff7800' }}
                  />
                  <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-24 w-24 text-white/25" aria-hidden />
                  </div>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
