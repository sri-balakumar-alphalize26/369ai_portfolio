import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check, ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { RevealGroup } from '@/components/ui/RevealGroup'
import { ButtonLink } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { PageHero } from '@/components/ui/PageHero'
import { Lightbox } from '@/components/ui/Lightbox'
import { AmbientVideo } from '@/components/ui/AmbientVideo'
import { EVENTS } from '@/content/events'
import { locales, localeLabels } from '@/i18n/routing'

const HIGHLIGHTS = ['h1', 'h2', 'h3'] as const
const POST_LABELS = ['post1', 'post2', 'post3'] as const

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
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/events`])
      ),
    },
  }
}

/** LinkedIn "in" mark — inline, lucide-react ships no brand icons. */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  )
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

      {EVENTS.map(({ key, hero, gallery, videos, posts }, i) => (
        // id + scroll-mt so /events#expo2025 lands below the floating header
        <Section key={key} id={key} tone={i % 2 === 1 ? 'alt' : 'white'} className="scroll-mt-32">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                {t(`items.${key}.date`)}
              </span>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{t(`items.${key}.title`)}</h2>
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
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {posts.map((url, n) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ms-link"
                  >
                    <span className="ms-link__mark" aria-hidden>
                      <LinkedInMark />
                    </span>
                    <span>{posts.length > 1 ? t(POST_LABELS[n]) : t('viewPost')}</span>
                    <span className="ms-link__arrow" aria-hidden>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-surface-line bg-surface-alt">
              <Lightbox
                src={hero}
                alt={t(`items.${key}.title`)}
                sizes="(min-width: 1024px) 45vw, 100vw"
                openLabel={tc('viewDetails')}
                closeLabel={tNav('close')}
              />
            </div>
          </div>

          {gallery.length ? (
            <>
              <h3 className="mt-14 text-lg font-semibold">{t('galleryTitle')}</h3>
              <RevealGroup className="mt-5 grid gap-4 sm:grid-cols-2">
                {gallery.map((src, n) => (
                  <li
                    key={src}
                    className="ms-card"
                    style={{ '--d': `${n * 140}ms` } as React.CSSProperties}
                  >
                    <div className="ms-media relative aspect-[4/3] overflow-hidden rounded-panel border border-surface-line bg-surface-alt">
                      <Lightbox
                        src={src}
                        alt={t(`items.${key}.title`)}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        openLabel={tc('viewDetails')}
                        closeLabel={tNav('close')}
                      />
                    </div>
                  </li>
                ))}
              </RevealGroup>
            </>
          ) : null}

          {videos.length ? (
            <>
              <h3 className="mt-14 text-lg font-semibold">{t('videosTitle')}</h3>
              {/* Silent loops that only load once scrolled to — six clips
                  cost nothing until the visitor reaches them. */}
              <RevealGroup className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((src, n) => (
                  <li
                    key={src}
                    className="ms-card"
                    style={{ '--d': `${n * 120}ms` } as React.CSSProperties}
                  >
                    <div className="ms-media overflow-hidden rounded-panel border border-surface-line">
                      <AmbientVideo src={src} className="aspect-video bg-brand-950" {...videoLabels} />
                    </div>
                  </li>
                ))}
              </RevealGroup>
            </>
          ) : null}
        </Section>
      ))}

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
