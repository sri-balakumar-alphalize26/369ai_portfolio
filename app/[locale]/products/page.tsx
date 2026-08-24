import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Smartphone, MonitorDown, WifiOff, Check, ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { locales } from '@/i18n/routing'

const MODULES = Array.from({ length: 22 }, (_, i) => `m${i + 1}`)
const POS_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']
const STEPS = ['s1', 's2', 's3', 's4']
const APPS = [
  { key: 'a1', Icon: Smartphone },
  { key: 'a2', Icon: MonitorDown },
  { key: 'a3', Icon: WifiOff },
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
  const t = await getTranslations({ locale, namespace: 'products' })
  return { title: t('title'), description: t('body').slice(0, 155) }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('products')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* ERP modules */}
      <Section>
        <SectionHeader title={t('modulesTitle')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((key, i) => (
            <Reveal as="li" key={key} delay={(i % 3) * 60}>
              <article className="card-glow h-full rounded-panel border border-surface-line bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold leading-snug">{t(`modules.${key}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted">
                  {t(`modules.${key}.b`)}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* POS features */}
      <Section tone="alt">
        <SectionHeader title={t('posTitle')} body={t('posBody')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POS_FEATURES.map((key, i) => (
            <Reveal as="li" key={key} delay={(i % 3) * 60}>
              <article className="card-glow flex h-full gap-4 rounded-panel border border-surface-line bg-white p-6">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold">{t(`pos.${key}.t`)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-muted">
                    {t(`pos.${key}.b`)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Apps & desktop software */}
      <Section>
        <SectionHeader title={t('appsTitle')} body={t('appsBody')} />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {APPS.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 70}>
              <article className="card-glow h-full rounded-panel border border-surface-line bg-white p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-card bg-accent-50 text-accent-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-bold">{t(`apps.${key}.t`)}</h3>
                <p className="mt-3 leading-relaxed text-slate-muted">{t(`apps.${key}.b`)}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* How it works */}
      <Section tone="alt">
        <SectionHeader title={t('howTitle')} body={t('howBody')} />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((key, i) => (
            <Reveal as="li" key={key} delay={i * 70}>
              <div className="relative h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="text-5xl font-bold leading-none text-brand-100">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t(`steps.${key}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted">
                  {t(`steps.${key}.b`)}
                </p>
                {i < STEPS.length - 1 ? (
                  <ArrowRight
                    className="absolute -end-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-brand-300 rtl:rotate-180 lg:block"
                    aria-hidden
                  />
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-brand-100">
              {t('ctaBody')}
            </p>
          </div>
          <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
            {tc('requestQuote')}
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
