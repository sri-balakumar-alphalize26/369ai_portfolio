import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Section } from '@/components/ui/Section'
import { PageHero } from '@/components/ui/PageHero'
import { ShopBrowser } from '@/components/shop/ShopBrowser'
import { PRODUCTS, CATEGORIES, toCardData } from '@/lib/products'
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
  const t = await getTranslations({ locale, namespace: 'shop' })

  return {
    title: t('title'),
    description: t('body').slice(0, 155),
    alternates: {
      canonical: `/${locale}/shop`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/shop`])
      ),
    },
  }
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('shop')

  const products = PRODUCTS.map(toCardData)
  const categories = CATEGORIES.map((c) => ({ name: c.name, count: c.count }))

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      <Section>
        {/* ShopBrowser reads ?category= via useSearchParams, which needs a
            Suspense boundary for this route to stay statically prerendered. */}
        <Suspense
          fallback={<p className="py-16 text-center text-slate-muted">{t('allProducts')}</p>}
        >
          <ShopBrowser products={products} categories={categories} base={`/${locale}`} />
        </Suspense>
      </Section>
    </>
  )
}
