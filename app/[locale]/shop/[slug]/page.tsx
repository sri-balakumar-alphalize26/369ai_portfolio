import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Check } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductCard } from '@/components/shop/ProductCard'
import { EnquiryButton } from '@/components/shop/EnquiryButton'
import { readContact, waNumber } from '@/lib/contact-settings'
import {
  PRODUCTS,
  getProduct,
  primaryCategory,
  relatedProducts,
  toCardData,
} from '@/lib/products'
import { locales, localeLabels } from '@/i18n/routing'

export function generateStaticParams() {
  return locales.flatMap((locale) => PRODUCTS.map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = getProduct(slug)
  if (!product) return {}

  const t = await getTranslations({ locale, namespace: 'shop' })

  return {
    title: product.name,
    description: (product.description || t('body')).slice(0, 155),
    alternates: {
      canonical: `/${locale}/shop/${slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/shop/${slug}`])
      ),
    },
    openGraph: {
      title: product.name,
      description: (product.description || t('body')).slice(0, 155),
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = getProduct(slug)
  if (!product) notFound()

  const t = await getTranslations('shop')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  const category = primaryCategory(product)
  const specs = Object.entries(product.specs)
  const related = relatedProducts(product)

  return (
    <>
      <Section className="pt-28 sm:pt-32" size="sm">
        <Link
          href={`${base}/shop`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-muted transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {tc('backToShop')}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            {category ? (
              <Link
                href={`${base}/shop?category=${encodeURIComponent(category)}`}
                className="text-xs font-semibold uppercase tracking-wider text-brand-600 transition-colors hover:text-brand-800"
              >
                {category}
              </Link>
            ) : null}

            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>

            <p className="mt-4 text-sm font-medium text-slate-faint">{tc('priceOnRequest')}</p>

            {product.description ? (
              <p className="mt-6 leading-relaxed text-slate-body">{product.description}</p>
            ) : null}

            <div className="mt-8">
              {/* The sales line comes from data/contact.json, so the enquiry
                  opens whatever number manage mode last saved. */}
              <EnquiryButton
                product={product.name}
                number={waNumber((await readContact()).phoneDisplay)}
              />
            </div>

            {product.features.length ? (
              <div className="mt-10">
                <h2 className="text-lg font-semibold">{t('features')}</h2>
                <ul className="mt-4 space-y-2.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-relaxed text-slate-body">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {specs.length ? (
        <Section tone="alt">
          <h2 className="text-2xl font-bold">{t('specifications')}</h2>
          <dl className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {specs.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-1 border-b border-surface-line py-4 sm:flex-row sm:gap-6"
              >
                <dt className="text-sm font-semibold text-ink sm:w-44 sm:shrink-0">{key}</dt>
                <dd className="text-sm leading-relaxed text-slate-muted">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {related.length ? (
        <Section>
          <SectionHeader title={t('relatedTitle')} align="start" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 60}>
                <ProductCard
                  product={toCardData(p)}
                  base={base}
                  viewLabel={tc('viewDetails')}
                />
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
