import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ScanBarcode, Network, BrainCircuit, Boxes, Cloud, Headset } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { locales } from '@/i18n/routing'

const SERVICES = [
  { key: 'pos', Icon: ScanBarcode },
  { key: 'erp', Icon: Network },
  { key: 'ai', Icon: BrainCircuit },
  { key: 'iot', Icon: Boxes },
  { key: 'cloud', Icon: Cloud },
  { key: 'support', Icon: Headset },
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
  const t = await getTranslations({ locale, namespace: 'services' })
  return { title: t('title'), description: t('body').slice(0, 155) }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('services')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      <Section>
        <ul className="grid gap-6 lg:grid-cols-2">
          {SERVICES.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={Math.floor(i / 2) * 150} className="svc-card">
              <article
                id={key}
                className="svc-card-inner card-glow h-full scroll-mt-32 rounded-panel border border-surface-line bg-white p-8"
              >
                <span className="svc-icon flex h-12 w-12 items-center justify-center rounded-card bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-6 text-xl font-bold">{t(`${key}.title`)}</h2>
                <p className="mt-3 font-medium text-brand-600">{t(`${key}.lead`)}</p>
                <p className="svc-body mt-4 leading-relaxed text-slate-muted">{t(`${key}.body`)}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Every service backed by 24/7 support
            </h2>
            <p className="mt-3 text-brand-100">
              A dedicated after-sales team, free remote management and a 12-month warranty as standard.
            </p>
          </div>
          <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
            {tc('talkToSales')}
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
