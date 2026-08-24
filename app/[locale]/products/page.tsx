import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { RequirementsFlow } from '@/components/products/RequirementsFlow'
import { locales } from '@/i18n/routing'

const MODULES = Array.from({ length: 22 }, (_, i) => `m${i + 1}`)
const POS_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']
const STEPS = ['s1', 's2', 's3', 's4']

/* Apps & desktop software icons — hand-drawn inline SVG, not lucide:
   each hover animates a SUB-PART of the glyph (home dot press, falling
   install arrow, failing wifi bars + slash), which an icon component's
   opaque path list can't do. Classed parts are animated in globals.css
   under .app-card. */
function PhoneArt() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <circle className="app-dot" cx="12" cy="18.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DesktopArt() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8.5 20h7" />
      <g className="app-arrow">
        <path d="M12 6.5v4.5" />
        <path d="M9.8 9.2 12 11.4l2.2-2.2" />
      </g>
    </svg>
  )
}

function OfflineArt() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path className="app-w1" d="M2.5 9.3a13.8 13.8 0 0 1 19 0" />
      <path className="app-w2" d="M5.5 12.4a9.5 9.5 0 0 1 13 0" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
      <path className="app-slash" d="M4 4l16 16" />
    </svg>
  )
}

const APPS = [
  { key: 'a1', Art: PhoneArt, tile: 'app-ic app-ic-phone' },
  { key: 'a2', Art: DesktopArt, tile: 'app-ic' },
  { key: 'a3', Art: OfflineArt, tile: 'app-ic' },
] as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products' })
  return { title: t('title'), description: t('body').slice(0, 155) }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('products')
  const tc = await getTranslations('common')
  const tb = await getTranslations('builder')
  const base = `/${locale}`

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* ERP modules */}
      <Section>
        <SectionHeader title={t('modulesTitle')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((key, i) => (
            // Deterministic scatter (hash, not Math.random): looks random,
            // stays identical on every visit. Sequential order would double
            // down on a numbering progression that is not real.
            <Reveal as="li" key={key} className="mod-card" delay={((i * 7919) % 11) * 42}>
              {/* No card-glow here — 22 cards lifting and casting shadows is
                  noise. The quiet mod-card hover (border tint + badge fill)
                  gives feedback with nothing changing position. */}
              <article className="h-full rounded-panel border border-surface-line bg-white p-6">
                <span className="mod-num flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold leading-snug">{t(`modules.${key}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted">
                  {t(`modules.${key}.b`)}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* POS features */}
      <Section tone="alt">
        <SectionHeader title={t('posTitle')} body={t('posBody')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POS_FEATURES.map((key, i) => (
            // Sequential 140ms stagger on purpose (unlike the modules grid's
            // scatter): this is a list, and row-by-row is how people read it.
            // Badge pop (+90ms) and tick draw (+230ms) ride on nth-child
            // delays in globals.css — one gesture, three beats.
            <Reveal as="li" key={key} className="pos-card" delay={i * 140}>
              {/* No card-glow lift — these cards aren't clickable, a lift
                  would over-promise. Hover is a badge nudge + border tint. */}
              <article className="flex h-full gap-4 rounded-panel border border-surface-line bg-white p-6">
                <span className="pos-badge mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                  {/* Inline path, not an icon font/component — the tick is
                      DRAWN via stroke-dashoffset (path length < 22). */}
                  <svg className="pos-tick h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold">{t(`pos.${key}.t`)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-muted">
                    {t(`pos.${key}.b`)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Apps & desktop software */}
      <Section>
        <SectionHeader title={t('appsTitle')} body={t('appsBody')} />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {APPS.map(({ key, Art, tile }) => (
            // Clip-wipe entrance: the card uncovers itself top to bottom —
            // nothing moves, nothing fades. Three cards can afford the
            // slower, deliberate 650ms (globals.css .app-card).
            <Reveal as="li" key={key} className="app-card">
              <article className="card-glow h-full rounded-panel border border-surface-line bg-white p-8">
                <span className={`${tile} flex h-12 w-12 items-center justify-center rounded-card bg-accent-50 text-accent-600`}>
                  <Art />
                </span>
                <h3 className="mt-6 text-lg font-bold">{t(`apps.${key}.t`)}</h3>
                <p className="mt-3 leading-relaxed text-slate-muted">{t(`apps.${key}.b`)}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* How it works */}
      <Section tone="alt">
        <SectionHeader title={t('howTitle')} body={t('howBody')} />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((key, i) => (
            // Relay timing: cards land 400ms apart; each arrow fires 250ms
            // into that gap (CSS, keyed on nth-child) so it appears BETWEEN
            // two cards arriving — a handoff, not four things fading in.
            // ~1.6s total, slower than anything else on the site: a sequence
            // should feel walked through, not flashed.
            <Reveal as="li" key={key} className="how-step" delay={i * 400}>
              <div className="relative h-full rounded-panel border border-surface-line bg-white p-7">
                {/* Masked-line reveal on the number: it rolls up from behind
                    its own baseline 130ms after the card arrives. The .how-num
                    height must equal the line-height exactly or the digits
                    sit off-baseline (both 48px in globals.css). */}
                <span className="how-num block text-5xl font-bold text-brand-100">
                  <b>{String(i + 1).padStart(2, '0')}</b>
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t(`steps.${key}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted">
                  {t(`steps.${key}.b`)}
                </p>
                {i < STEPS.length - 1 ? (
                  <ArrowRight
                    className="how-arrow absolute -end-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-brand-300 rtl:rotate-180 lg:block"
                    aria-hidden
                  />
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* Client requirements → outputs (client-supplied animation) */}
      <Section>
        <SectionHeader title={tb('title')} body={tb('body')} />
        <div className="mt-14">
          <RequirementsFlow />
        </div>
      </Section>

      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-brand-100">
              {t('ctaBody')}
            </p>
          </div>
          <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
            {tc('requestQuote')}
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
