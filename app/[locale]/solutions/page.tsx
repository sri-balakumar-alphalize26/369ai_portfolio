import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Database, ScanBarcode, Bot, Lock, Boxes, ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { locales } from '@/i18n/routing'

const SOLUTIONS = [
  { key: 'erp', Icon: Database },
  { key: 'pos', Icon: ScanBarcode },
  { key: 'robotics', Icon: Bot },
  { key: 'locks', Icon: Lock },
  { key: 'vending', Icon: Boxes },
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
  const t = await getTranslations({ locale, namespace: 'solutions' })
  return {
    title: t('title'),
    description: t('body').slice(0, 155),
  }
}

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('solutions')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      <Section>
        <div className="space-y-20 lg:space-y-28">
          {SOLUTIONS.map(({ key, Icon }, i) => (
            <Reveal key={key}>
              <div
                id={key}
                className={`grid scroll-mt-32 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-panel bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-lg shadow-cyan-900/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h2 className="mt-6 text-2xl font-bold sm:text-3xl">{t(`${key}.title`)}</h2>
                  <p className="mt-2 text-lg font-semibold text-accent-600">
                    {t(`${key}.tagline`)}
                  </p>
                  <p className="mt-5 text-[1.05rem] leading-relaxed text-slate-body">
                    {t(`${key}.body`)}
                  </p>
                  <ButtonLink href={`${base}/contact`} variant="outline" className="mt-7">
                    {tc('talkToSales')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </ButtonLink>
                </div>

                {/* Abstract brand panel rather than stock photography. */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
                  <div
                    aria-hidden
                    className="aurora-blob aurora-a absolute h-72 w-72 opacity-40"
                    style={{ top: '-4rem', insetInlineStart: '-3rem', background: '#30a8c0' }}
                  />
                  <div
                    aria-hidden
                    className="aurora-blob aurora-b absolute h-56 w-56 opacity-30"
                    style={{ bottom: '-3rem', insetInlineEnd: '-2rem', background: '#ff7800' }}
                  />
                  <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-24 w-24 text-white/25" aria-hidden />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Not sure which solution fits?
            </h2>
            <p className="mt-3 text-brand-100">
              Tell us what you run today and we will map it out with you — no obligation.
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
