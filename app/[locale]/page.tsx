import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  BrainCircuit,
  ScanBarcode,
  Boxes,
  Network,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Headset,
} from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { TechMarquee } from '@/components/home/TechMarquee'
import { StatsRow } from '@/components/home/StatsRow'
import { Hero } from '@/components/home/Hero'
import { Faq } from '@/components/home/Faq'
import { LeadershipVideos } from '@/components/home/LeadershipVideos'
import { AppIntegrations } from '@/components/home/AppIntegrations'
import { PRODUCTS } from '@/lib/products'

const PILLARS = [
  { key: 'ai', Icon: BrainCircuit },
  { key: 'pos', Icon: ScanBarcode },
  { key: 'iot', Icon: Boxes },
  { key: 'erp', Icon: Network },
] as const

const EXTRA_SERVICES = [
  { key: 'support', Icon: Headset },
  { key: 'cloud', Icon: Cloud },
  { key: 'ai', Icon: BrainCircuit },
  { key: 'erp', Icon: ShieldCheck },
] as const

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tp = await getTranslations('pillars')
  const ts = await getTranslations('services')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  return (
    <>
      <Hero base={base} />

      {/* ------------------------------------------------------------- Pillars */}
      <Section tone="alt">
        <SectionHeader title={t('pillarsTitle')} body={t('pillarsBody')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 70}>
              <div className="card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{tp(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {tp(`${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------ App ecosystem */}
      <AppIntegrations />

      {/* --------------------------------------------------------------- About */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeader
              eyebrow={t('aboutEyebrow')}
              title={t('aboutTitle')}
              align="start"
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="space-y-4 text-[1.05rem] leading-relaxed text-slate-body">
              <p>{t('aboutBody')}</p>
              <p>{t('aboutBody2')}</p>
              <Link
                href={`${base}/about`}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
              >
                {tc('learnMore')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Leadership */}
      <Section tone="alt">
        <SectionHeader title={t('leadershipTitle')} body={t('leadershipBody')} />
        <div className="mt-12">
          <LeadershipVideos />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- Stats */}
      <StatsRow title={t('statsTitle')} />

      {/* ------------------------------------------------------------- Services */}
      <Section tone="alt">
        <SectionHeader eyebrow={t('servicesEyebrow')} title={t('servicesTitle')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXTRA_SERVICES.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 70}>
              <Link
                href={`${base}/services#${key}`}
                className="card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7 transition-all duration-200 hover:-translate-y-1.5 hover:border-brand-400 active:translate-y-0"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-accent-50 text-accent-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{ts(`${key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">
                  {ts(`${key}.lead`)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <ButtonLink href={`${base}/services`} variant="outline">
            {tc('seeAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </ButtonLink>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Hardware */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Hardware"
            title="Built on equipment we supply and support"
            body={`${PRODUCTS.length} POS terminals, printers, scanners, kiosks, vending machines and robots — all available on request.`}
            align="start"
          />
          <ButtonLink href={`${base}/shop`} variant="primary">
            {tc('seeAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </ButtonLink>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.filter((p) => p.images.length)
            .slice(0, 8)
            .map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 50}>
                <Link
                  href={`${base}/shop/${p.slug}`}
                  className="card-glow group flex h-full flex-col overflow-hidden rounded-card border border-surface-line bg-white"
                >
                  <div className="flex aspect-square items-center justify-center bg-surface-alt p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="line-clamp-2 p-3.5 text-xs font-medium leading-snug text-slate-body">
                    {p.name}
                  </p>
                </Link>
              </Reveal>
            ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------- Technology */}
      <Section tone="alt">
        <SectionHeader title={t('techTitle')} body={t('techBody')} />
        <div className="mt-14">
          <TechMarquee />
        </div>
      </Section>

      {/* ----------------------------------------------------------------- FAQ */}
      <Section>
        <SectionHeader title={t('faqTitle')} body={t('faqBody')} />
        <div className="mx-auto mt-12 max-w-3xl">
          <Faq />
        </div>
      </Section>

      {/* ----------------------------------------------------------------- CTA */}
      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('ctaTitle')}</h2>
            <p className="mt-3 text-slate-300">{t('ctaBody')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
              {t('ctaPrimary')}
            </ButtonLink>
            <ButtonLink href={`${base}/shop`} variant="onDark" size="lg">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  )
}
