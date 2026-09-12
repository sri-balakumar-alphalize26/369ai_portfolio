import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { PageHero } from '@/components/ui/PageHero'
import { MaskedHeading } from '@/components/ui/MaskedHeading'
import { Lightbox } from '@/components/ui/Lightbox'
import { AwardCard } from '@/components/events/AwardCard'
import { EventsJourney } from '@/components/events/EventsJourney'
import { EventMedia } from '@/components/events/EventMedia'
import { VideoStack } from '@/components/events/VideoStack'
import { FloorVideo } from '@/components/events/FloorVideo'
import { EVENTS } from '@/content/events'
import { locales, localeLabels } from '@/i18n/routing'

const HIGHLIGHTS = ['h1', 'h2', 'h3'] as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'events' })
  return {
    title: t('title'),
    description: t('body').slice(0, 155),
    alternates: {
      canonical: `/${locale}/events`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [localeLabels[l].hreflang, `/${l}/events`])
        ),
        // Anyone matching none of the nine lands on English.
        'x-default': `/en/events`,
      },
    },
  }
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('events')
  const tc = await getTranslations('common')
  const tNav = await getTranslations('nav')
  const ta = await getTranslations('about') // video-control labels live there
  const base = `/${locale}`

  const videoLabels = {
    playLabel: ta('playVideo'),
    pauseLabel: ta('pauseVideo'),
    unmuteLabel: ta('unmuteVideo'),
    muteLabel: ta('muteVideo'),
  }

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* The thread runs the length of both events; its lane is the padding
          reserved on each section's inner column (data-lane). */}
      <EventsJourney
        title={t('roadmapTitle')}
        nodes={EVENTS.map(({ key }) => ({
          key,
          date: t(`items.${key}.date`),
          label: t(`items.${key}.title`),
        }))}
      >
        {EVENTS.map(({ key, hero, videos, award }, i) => (
          // id + scroll-mt so /events#expo2025 lands below the floating header
          <Section key={key} id={key} tone={i % 2 === 1 ? 'alt' : 'white'} className="scroll-mt-32">
            <div data-lane className="ps-14 lg:ps-24">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div>
                  <div
                    data-anchor
                    data-bead
                    data-bias={i === 0 ? '0.62' : '0.66'}
                    data-jr-reveal={`#${key}`}
                  >
                    <span className="inline-flex rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                      {t(`items.${key}.date`)}
                    </span>
                    <MaskedHeading
                      text={t(`items.${key}.title`)}
                      className="mt-4 text-2xl font-bold sm:text-3xl"
                    />
                  </div>
                  <p className="mt-4 text-[1.05rem] leading-relaxed text-slate-body">
                    {t(`items.${key}.body`)}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {HIGHLIGHTS.map((h) => (
                      <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-slate-body">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                        {t(`items.${key}.${h}`)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The hero swings open, and an arrow circles its frame —
                    anti-clockwise on the expo, clockwise on BizConnect. */}
                <EventMedia
                  direction={key === 'expo2025' ? 'ccw' : 'cw'}
                  tone={key === 'expo2025' ? 'accent' : 'brand'}
                  className="aspect-[4/3] bg-surface-alt"
                >
                  <Lightbox
                    src={hero}
                    alt={t(`items.${key}.title`)}
                    fit="cover"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    openLabel={tc('viewDetails')}
                    closeLabel={tNav('close')}
                  />
                </EventMedia>
              </div>


              {videos.length > 1 ? (
                <>
                  <h3
                    data-anchor
                    data-bias="0.30"
                    className="mt-14 text-lg font-semibold"
                  >
                    {t('videosTitle')}
                  </h3>
                  <VideoStack videos={videos} {...videoLabels} />
                  <div data-anchor data-bias="0.5" aria-hidden className="h-2" />
                </>
              ) : videos.length === 1 ? (
                // A single clip has nothing to stack: it gets the blinds
                // reveal, heading, video and caption on one column.
                <FloorVideo
                  src={videos[0].src}
                  heading={t('videosTitle')}
                  caption={t(`items.${key}.videoCaption`)}
                  card={
                    award ? (
                      <AwardCard
                        srcs={award.srcs}
                        labels={award.labels.map((l) => t(`award.${l}`))}
                        prevLabel={t('prevImage')}
                        nextLabel={t('nextImage')}
                        openLabel={tc('viewDetails')}
                        closeLabel={tNav('close')}
                      />
                    ) : null
                  }
                  {...videoLabels}
                />
              ) : null}
            </div>
          </Section>
        ))}
        {/* Carries the thread past the last section instead of
            parking the arrow at the final heading. */}
        <div data-anchor data-bias="0.5" aria-hidden className="h-24" />

        {/* The CTA lives inside the journey so the thread runs down into it
            rather than stopping short of the page's last card. */}
        <div data-thread-end aria-hidden />
        <Section tone="dark" size="sm">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('ctaTitle')}</h2>
              <p className="mt-3 text-brand-100">{t('ctaBody')}</p>
            </div>
            <Magnetic>
              <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
                {tc('talkToSales')}
              </ButtonLink>
            </Magnetic>
          </div>
          </Section>
        <div data-anchor data-bias="0.5" aria-hidden className="h-2" />
      </EventsJourney>

    </>
  )
}
