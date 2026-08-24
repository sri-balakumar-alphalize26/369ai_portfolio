import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Lightbulb,
  HeartHandshake,
  ShieldCheck,
  LifeBuoy,
  Factory,
  Wrench,
  MonitorCog,
  BadgeCheck,
  Clock,
  Target,
  Eye,
} from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { PageHero } from '@/components/ui/PageHero'
import { StatsRow } from '@/components/home/StatsRow'
import { locales } from '@/i18n/routing'

const DIFFERENTIATORS = [
  { key: 'innovation', Icon: Lightbulb },
  { key: 'client', Icon: HeartHandshake },
  { key: 'quality', Icon: ShieldCheck },
  { key: 'support', Icon: LifeBuoy },
] as const

/** "Everything you need" — laid out as a bento grid, not a uniform row. */
const EVERYTHING = [
  { key: 'e1', Icon: Clock, span: 'sm:col-span-2' },
  { key: 'e2', Icon: Wrench, span: '' },
  { key: 'e3', Icon: Factory, span: '' },
  { key: 'e4', Icon: BadgeCheck, span: '' },
  { key: 'e5', Icon: MonitorCog, span: 'sm:col-span-2' },
  { key: 'e6', Icon: ShieldCheck, span: '' },
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

      {/* What sets us apart */}
      <Section>
        <SectionHeader title={t('featuresTitle')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 60}>
              <div className="card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {t(`${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <StatsRow title={th('statsTitle')} />

      {/* Everything you need — bento */}
      <Section tone="alt">
        <SectionHeader title={t('everythingTitle')} body={t('everythingBody')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-3">
          {EVERYTHING.map(({ key, Icon, span }, i) => (
            <Reveal as="li" key={key} delay={i * 55} className={span}>
              <div className="card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {t(`${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  )
}
