import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { UserRound } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { Lightbox } from '@/components/ui/Lightbox'
import { CeoReveal } from '@/components/ceo/CeoReveal'
import { AwardVideo } from '@/components/ceo/AwardVideo'
import { LeadershipVideos } from '@/components/home/LeadershipVideos'
import { CEO } from '@/content/ceo'
import { CEO_TALKS } from '@/content/videos'
import { locales, localeLabels } from '@/i18n/routing'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ceo' })
  return {
    title: t('title'),
    description: t('intro1').slice(0, 155),
    alternates: {
      canonical: `/${locale}/ceo`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [localeLabels[l].hreflang, `/${l}/ceo`])
        ),
        // Anyone matching none of the nine lands on English.
        'x-default': `/en/ceo`,
      },
    },
  }
}

export default async function CeoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('ceo')
  const tc = await getTranslations('common')
  const tNav = await getTranslations('nav')
  const ta = await getTranslations('about') // video-control labels live there
  const base = `/${locale}`

  return (
    <>
      {/* Hero — above the fold, so it plays on mount: the portrait rises
          behind its frame, the name rolls out of its mask, copy follows. */}
      <Section tone="dark" className="pt-32 sm:pt-36 lg:pt-40">
        <CeoReveal on="mount" className="ceo grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-[60px]">
          {/* The frame is the mask: the portrait rises up from behind it,
              then the accent ring settles over the edge. */}
          <div className="ceo__portrait relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-panel bg-brand-900 shadow-[0_22px_44px_-20px_rgba(0,0,0,.6)] lg:mx-0 lg:max-w-none">
            {CEO.portrait ? (
              <Image
                src={CEO.portrait}
                alt={t('portraitAlt')}
                fill
                sizes="(min-width: 1024px) 340px, 260px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserRound className="h-20 w-20 text-white/30" aria-hidden />
              </div>
            )}
            <span className="ceo__ring" aria-hidden />
          </div>

          <div>
            <p className="ceo__kicker text-sm font-semibold uppercase text-brand-300">
              {t('eyebrow')}
            </p>
            {/* Same line mask the event titles use — the name is one line, so
                it needs no measuring, just the clip box and the delay. */}
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
              <span className="ln">
                <i style={{ '--d': '360ms' } as React.CSSProperties}>{CEO.name}</i>
              </span>
            </h1>
            <p className="ceo__role mt-3 text-lg text-brand-200">
              {t('role')} · {CEO.company}
            </p>
            <p
              className="ceo__text mt-6 text-[1.05rem] leading-relaxed text-brand-100"
              style={{ '--d': '600ms' } as React.CSSProperties}
            >
              {t('intro1')}
            </p>
            <p
              className="ceo__text mt-4 text-[1.05rem] leading-relaxed text-brand-100"
              style={{ '--d': '700ms' } as React.CSSProperties}
            >
              {t('intro2')}
            </p>

            <span className="ceo__cta relative mt-9 inline-block">
              <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
                {tc('talkToSales')}
              </ButtonLink>
              <span className="ceo__bloom" aria-hidden />
            </span>
          </div>
        </CeoReveal>
      </Section>

      {/* The award — the trophy and the moment zoom in a lightbox; the clip
          below them is uncovered by a panel the colour of this band. */}
      <Section tone="alt">
        <CeoReveal className="aw">
          <span className="aw__chip inline-flex rounded-pill bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
            {t('awardEyebrow')}
          </span>
          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            <span className="ln">
              <i style={{ '--d': '260ms' } as React.CSSProperties}>{t('awardTitle')}</i>
            </span>
          </h2>
          <p className="aw__text mt-4 max-w-[70ch] text-[1.05rem] leading-relaxed text-slate-body">
            {t('awardBody')}
          </p>

          {/* Column widths follow the two ratios, so both photos come out the
              same height with neither one cropped. */}
          <div className="mt-10 grid items-center gap-5 sm:grid-cols-[0.667fr_1.555fr]">
            {CEO.award.images.map(({ src, alt, ratio, shine }, i) => (
              <div
                key={src}
                className="aw__card card-glow relative overflow-hidden rounded-panel border border-surface-line bg-surface-alt"
                style={{ aspectRatio: ratio, '--d': `${560 + i * 120}ms` } as React.CSSProperties}
              >
                <Lightbox
                  src={src}
                  alt={t(alt)}
                  sizes="(min-width: 640px) 45vw, 100vw"
                  openLabel={tc('viewDetails')}
                  closeLabel={tNav('close')}
                />
                {shine ? <span className="aw__shine" aria-hidden /> : null}
              </div>
            ))}
          </div>
        </CeoReveal>

        <AwardVideo
          src={CEO.award.video}
          heading={t('awardVideoTitle')}
          caption={t('awardCaption')}
          playLabel={ta('playVideo')}
          pauseLabel={ta('pauseVideo')}
          unmuteLabel={ta('unmuteVideo')}
          muteLabel={ta('muteVideo')}
        />
      </Section>

      {/* His channel's mind-management sessions. The two speeches credited on
          YouTube to other speakers stay off this page (see content/videos.ts). */}
      <Section>
        <SectionHeader title={t('talksTitle')} body={t('talksBody')} />
        <div className="mt-12">
          <LeadershipVideos videos={CEO_TALKS} />
        </div>
      </Section>

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
    </>
  )
}
