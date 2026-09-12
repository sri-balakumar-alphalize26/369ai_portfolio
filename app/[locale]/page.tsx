import { redirect } from 'next/navigation'
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
import { Magnetic } from '@/components/ui/Magnetic'
import { TechMarquee } from '@/components/home/TechMarquee'
import { StatsRow } from '@/components/home/StatsRow'
import { Testimonials } from '@/components/home/Testimonials'
import { UnlockDialog } from '@/components/careers/UnlockDialog'
import { readPublishedTestimonials, readTestimonials } from '@/lib/testimonials'
import { isUnlocked, sessionHours } from '@/lib/careers-auth'
import { Hero } from '@/components/home/Hero'
import { Faq } from '@/components/home/Faq'
import { LeadershipVideos } from '@/components/home/LeadershipVideos'
import { AppIntegrations } from '@/components/home/AppIntegrations'
import { PRODUCTS, toCardData } from '@/lib/products'
import { AppsStack } from '@/components/apps/AppsStack'
import { appsWithIcons } from '@/lib/apps'
import { organizationJsonLd } from '@/lib/structured-data'
import { ConnectedPillars } from '@/components/home/ConnectedPillars'
import { ConnectedStage } from '@/components/ui/ConnectedStage'
import { RotatingTitle } from '@/components/home/RotatingTitle'
import { HardwareStrip } from '@/components/home/HardwareStrip'
import { TrustedPartners } from '@/components/home/TrustedPartners'

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
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ manage?: string; review?: string; name?: string; product?: string }>
}) {
  const { locale } = await params
  const { manage, review, name, product } = await searchParams

  // ?manage=0 is the instant lock. Deleting the session cookie is not
  // allowed during a page render, so hand off to the route handler that
  // clears it and sends the visitor back here without the parameter.
  if (manage === '0') {
    redirect(`/api/manage/lock?next=${encodeURIComponent(`/${locale}`)}`)
  }
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tp = await getTranslations('pillars')
  const ts = await getTranslations('services')
  const tc = await getTranslations('common')
  const ta = await getTranslations('appsPage')
  const tNav = await getTranslations('nav')
  const base = `/${locale}`
  const apps = appsWithIcons()

  // Reviews are managed here too, behind the same passcode as the job
  // roles: a valid session saves re-typing it, but nothing is editable
  // unless the URL asks for it.
  const unlocked = await isUnlocked()
  const managing = manage === '1'
  const canEdit = unlocked && managing
  // Hidden reviews are filtered HERE, not in the component: props are
  // serialised into the page payload, so a browser filter would still ship
  // unapproved text — spam and abuse included — to every visitor.
  const testimonials = canEdit ? await readTestimonials() : await readPublishedTestimonials()
  const hours = await sessionHours()

  return (
    <>
      <script
        type="application/ld+json"
        // Server-rendered from our own content files; nothing here is user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd(t('heroBody'))),
        }}
      />

      <Hero base={base} />

      {/* ------------------------------------------------------------- Pillars */}
      <Section tone="alt">
        <SectionHeader title={t('pillarsTitle')} body={t('pillarsBody')} />
        {/* The copy says every part talks to every other part; the connector
            line + travelling pulse make the layout say it too. */}
        <ConnectedPillars
          items={PILLARS.map(({ key }) => ({
            title: tp(`${key}.title`),
            body: tp(`${key}.body`),
          }))}
        />
      </Section>

      {/* ------------------------------------------------------ App ecosystem */}
      <AppIntegrations />

      {/* --------------------------------------------------------------- About */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeader
              eyebrow={t('aboutEyebrow')}
              title={
                <RotatingTitle
                  full={t('aboutTitle')}
                  lead={t('aboutTitleLead')}
                  words={[t('aboutWord1'), t('aboutWord2'), t('aboutWord3')]}
                />
              }
              align="start"
              rule
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="space-y-4 text-[1.05rem] leading-relaxed text-slate-body">
              <p>{t('aboutBody')}</p>
              <p>{t('aboutBody2')}</p>
              <Link
                href={`${base}/about`}
                className="learn-more inline-flex items-center gap-1.5 rounded-pill border border-surface-line px-5 py-2.5 font-semibold text-brand-600"
              >
                {/* span, not a bare text node — the sweep ::before is
                    positioned, so it paints above unwrapped text */}
                <span>{tc('learnMore')}</span>
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

      {/* --------------------------------------------------------- Testimonials */}
      {/* Straight after the numbers: the stats earn attention, the quotes
          justify it. Renders nothing until there are real quotes. */}
      <Section>
        <SectionHeader title={t('clientsTitle')} body={t('clientsBody')} />
        <div className="mt-12">
          <Testimonials
            entries={testimonials}
            canEdit={canEdit}
            openReview={review === '1'}
            reviewName={name ?? ''}
            reviewProduct={product ?? ''}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------- Services */}
      <Section tone="alt">
        <SectionHeader eyebrow={t('servicesEyebrow')} title={t('servicesTitle')} />
        {/* Same connector-line + pulse treatment as the pillars row — both
            are four opaque p-7 cards with h-11 icon tiles, so the shared
            stage geometry lines up with the icons here too. */}
        <ConnectedStage className="mt-14">
          <ul className="connected-grid svc-preview grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_SERVICES.map(({ key, Icon }, i) => (
              <Reveal as="li" key={key} delay={i * 70}>
                <Link
                  href={`${base}/services#${key}`}
                  className="card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7 transition-all duration-200 hover:-translate-y-1.5 hover:border-accent-400 active:translate-y-0"
                >
                  <span className="svc-ic flex h-11 w-11 items-center justify-center rounded-card bg-accent-50 text-accent-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{ts(`${key}.title`)}</h3>
                  <p className="svc-lead mt-2.5 text-sm leading-relaxed text-slate-muted">
                    {ts(`${key}.lead`)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </ConnectedStage>
        <div className="mt-10 text-center">
          <ButtonLink href={`${base}/services`} variant="outline">
            {tc('seeAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </ButtonLink>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Our Apps */}
      <Section>
        <SectionHeader eyebrow={ta('eyebrow')} title={ta('title')} body={ta('body')} />
        <div className="mt-14">
          <AppsStack apps={apps} cta={{ href: `${base}/apps`, label: tNav('apps') }} />
        </div>
      </Section>

      {/* ------------------------------------------------------------ Hardware */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow={t('hardwareEyebrow')}
            title={t('hardwareTitle')}
            body={t('hardwareBody', { count: PRODUCTS.length })}
            align="start"
          />
          <ButtonLink href={`${base}/shop`} variant="primary">
            {tc('seeAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </ButtonLink>
        </div>
        {/* Chip filtering with a FLIP reflow — 75 products is a catalogue,
            not a strip of eight. */}
        <HardwareStrip
          items={PRODUCTS.filter((p) => p.images.length).map(toCardData)}
          base={base}
        />
      </Section>

      {/* ---------------------------------------------------------- Technology */}
      <Section tone="alt">
        <SectionHeader title={t('techTitle')} body={t('techBody')} />
        <div className="mt-14">
          <TechMarquee />
        </div>
      </Section>

      {/* ------------------------------------------------------------ Partners */}
      {/* Same tone as the marquee above deliberately: the two read as one
          "who and what we work with" band rather than two stacked strips. */}
      <Section tone="alt">
        <SectionHeader title={t('partnersTitle')} />
        <TrustedPartners />
      </Section>

      {/* ----------------------------------------------------------------- FAQ */}
      <Section>
        <SectionHeader title={t('faqTitle')} body={t('faqBody')} />
        <div className="mx-auto mt-12 max-w-5xl">
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
            <Magnetic>
              <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
                {t('ctaPrimary')}
              </ButtonLink>
            </Magnetic>
            <ButtonLink href={`${base}/shop`} variant="onDark" size="lg">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Same lock as the careers page — one passcode, one session. */}
      {managing && !unlocked ? <UnlockDialog hours={hours} /> : null}
    </>
  )
}
