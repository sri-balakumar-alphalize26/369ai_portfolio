import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Section, SectionHeader } from '@/components/ui/Section'
import { RevealGroup } from '@/components/ui/RevealGroup'
import { ButtonLink } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { PageHero } from '@/components/ui/PageHero'
import { AppsStack } from '@/components/apps/AppsStack'
import { AppIcon } from '@/components/apps/AppIcon'
import { appsWithIcons } from '@/lib/apps'
import { locales, localeLabels } from '@/i18n/routing'

const FEATURES = ['f1', 'f2', 'f3'] as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'appsPage' })
  return {
    title: t('title'),
    description: t('body').slice(0, 155),
    alternates: {
      canonical: `/${locale}/apps`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/apps`])
      ),
    },
  }
}

export default async function AppsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('appsPage')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  const apps = appsWithIcons()

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* The stacking pair needs scroll runway below it so card 2 can finish
          sliding over card 1 before the next section arrives. */}
      <Section>
        <AppsStack apps={apps} />
      </Section>

      {/* Per-app detail — the depth that can't fit on one sticky card.
          Cards land in row pairs; inside each, a rail draws down the
          feature list while the bullets slide in beside it (RevealGroup +
          .appd-card/.app-list in globals.css). */}
      <Section tone="alt">
        <SectionHeader title={t('detailTitle')} body={t('detailBody')} />
        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-2">
          {apps.map((app, i) => (
            <li
              key={app.id}
              className="appd-card"
              style={{ '--d': `${Math.floor(i / 2) * 160}ms` } as React.CSSProperties}
            >
              <article className="card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <div className="flex items-center gap-4">
                  <AppIcon app={app} className="h-14 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold">{app.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-accent-600">
                      {t(`items.${app.id}.tagline`)}
                    </p>
                  </div>
                </div>
                <ul className="app-list mt-5 space-y-2.5">
                  {FEATURES.map((f) => (
                    <li key={f} className="text-sm leading-relaxed text-slate-body">
                      {t(`items.${app.id}.${f}`)}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </RevealGroup>
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
