import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Lightbulb,
  HeartHandshake,
  ShieldCheck,
  LifeBuoy,
  Boxes,
  Smartphone,
  MonitorCog,
  Store,
  Network,
  Target,
  Eye,
  Check,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { DeckReveal } from '@/components/ui/DeckReveal'
import { RevealGroup } from '@/components/ui/RevealGroup'
import { MILESTONES } from '@/content/milestones'
import { AmbientVideo } from '@/components/ui/AmbientVideo'
import { Lightbox } from '@/components/ui/Lightbox'
import { PageHero } from '@/components/ui/PageHero'
import { StatsRow } from '@/components/home/StatsRow'
import { locales } from '@/i18n/routing'

const DIFFERENTIATORS = [
  { key: 'innovation', Icon: Lightbulb },
  { key: 'client', Icon: HeartHandshake },
  { key: 'quality', Icon: ShieldCheck },
  { key: 'support', Icon: LifeBuoy },
] as const

/** "Everything you need" — six equal cards: two clean rows of three, no
    ragged slot for the entrance animation to draw attention to. */
const EVERYTHING = [
  { key: 'e1', Icon: Boxes },
  { key: 'e2', Icon: Smartphone },
  { key: 'e3', Icon: MonitorCog },
  { key: 'e4', Icon: Store },
  { key: 'e5', Icon: Network },
  { key: 'e6', Icon: ShieldCheck },
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
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('eyebrow'), description: t('intro').slice(0, 155) }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')
  const th = await getTranslations('home')
  const tc = await getTranslations('common')
  const tNav = await getTranslations('nav')
  const base = `/${locale}`

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} />

      <Section>
        {/* Paragraph-level stagger — the paragraph is the smallest unit worth
            animating on dense copy; anything finer makes people wait to read.
            360ms total across the three. */}
        <Reveal className="about-prose">
          <div className="mx-auto max-w-3xl space-y-5 text-[1.05rem] leading-relaxed text-slate-body">
            <p>{t('intro')}</p>
            <p>{t('intro2')}</p>
            <p>{t('intro3')}</p>
          </div>
        </Reveal>
      </Section>

      {/* Mission & Vision */}
      <Section tone="alt">
        {/* A matched pair, animated as ONE gesture: Mission converges from
            the left, Vision from the right, Vision running 100ms behind so
            they read as linked. Four beats per card: land → icon pop → the
            orange rule wipes across the top edge. No card-glow here — its
            hover ::before would collide with the top-rule ::before, and the
            converge is the treatment. */}
        <Reveal className="mv-pair">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { Icon: Target, title: t('missionTitle'), body: t('missionBody') },
              { Icon: Eye, title: t('visionTitle'), body: t('visionBody') },
            ].map(({ Icon, title, body }) => (
              <article
                key={title}
                className="mv-card h-full rounded-panel border border-surface-line bg-white p-8"
              >
                <span className="mv-ic flex h-12 w-12 items-center justify-center rounded-card bg-accent-50 text-accent-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-6 text-2xl font-bold">{title}</h2>
                <p className="mt-4 leading-relaxed text-slate-muted">{body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* What sets us apart — cards deal out of a centered deck (DeckReveal) */}
      <Section>
        <SectionHeader title={t('featuresTitle')} />
        <DeckReveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map(({ key, Icon }) => (
            <li key={key} className="deck-card">
              <div className="card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {t(`${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </DeckReveal>
      </Section>

      {/* Milestones — company updates, copy rewritten for the site, each
          linking to its LinkedIn post. Same flood-card entrance as the
          "Everything you need" grid below. */}
      <Section tone="alt">
        <SectionHeader title={t('milestonesTitle')} body={t('milestonesBody')} />
        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
          {MILESTONES.map(({ key, Icon, images, video, linkedin, href }, i) => (
            <li
              key={key}
              className="ms-card"
              style={{ '--d': `${i * 180}ms` } as React.CSSProperties}
            >
              <article className="card-glow flex h-full flex-col overflow-hidden rounded-panel border border-surface-line bg-white">
                {/* Media wipes open from the centre (globals.css .ms-media). */}
                <div className="ms-media">
                  {video ? (
                    /* The inauguration film runs like a GIF — a muted loop
                       while on screen, no native controls (no download menu);
                       hover shows play (restarts with sound) + a speaker toggle. */
                    <AmbientVideo
                      src={video}
                      className="aspect-video bg-brand-950"
                      playLabel={t('playVideo')}
                      pauseLabel={t('pauseVideo')}
                      unmuteLabel={t('unmuteVideo')}
                      muteLabel={t('muteVideo')}
                    />
                  ) : images.length ? (
                    /* 16:9 box like the video; the image is contained (the
                       partnership graphic is square) and opens in a lightbox. */
                    <div className={`grid gap-1 bg-surface-alt ${images.length > 1 ? 'grid-cols-2' : ''}`}>
                      {images.map((src) => (
                        <div key={src} className="relative aspect-video">
                          <Lightbox
                            src={src}
                            alt={t(`milestones.${key}.title`)}
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            openLabel={tc('viewDetails')}
                            closeLabel={tNav('close')}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
                      <Icon className="h-14 w-14 text-white/40" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <span className="ms-date inline-flex self-start rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                    {t(`milestones.${key}.date`)}
                  </span>
                  <h3 className="ms-title mt-4 text-xl font-bold">{t(`milestones.${key}.title`)}</h3>
                  <div className="ms-body">
                    <p className="mt-3 leading-relaxed text-slate-muted">
                      {t(`milestones.${key}.body`)}
                    </p>
                    {key === 'partnership' ? (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {(['f1', 'f2', 'f3', 'f4'] as const).map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-slate-body">
                            <Check className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                            {t(`milestones.partnership.${f}`)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {/* LinkedIn mark + arrow for posts; an internal "Learn more" for
                      milestones that have their own page (globals.css .ms-link). */}
                  {linkedin ? (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-link mt-6 self-start"
                    >
                      <span className="ms-link__mark" aria-hidden>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                      </span>
                      <span>{t('viewPost')}</span>
                      <span className="ms-link__arrow" aria-hidden>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ) : href ? (
                    <Link href={`${base}${href}`} className="ms-link ms-link--site mt-6 self-start">
                      <span>{tc('learnMore')}</span>
                      <span className="ms-link__arrow" aria-hidden>
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </span>
                    </Link>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </RevealGroup>
      </Section>

      <StatsRow title={th('statsTitle')} />

      {/* Everything you need — cards drop in, icon tiles flood (RevealGroup) */}
      <Section tone="alt">
        <SectionHeader title={t('everythingTitle')} body={t('everythingBody')} />
        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVERYTHING.map(({ key, Icon }, i) => (
            <li
              key={key}
              className="flood-card"
              style={{ '--d': `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7">
                <span className="icon-tile flex h-11 w-11 items-center justify-center rounded-card">
                  <span className="flood" aria-hidden />
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {t(`${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}
