import type { MetadataRoute } from 'next'
import { defaultLocale, locales, localeLabels } from '@/i18n/routing'
import { PRODUCTS } from '@/lib/products'
import { SITE_URL } from '@/lib/site'

/**
 * One <url> per page, not per locale.
 *
 * The nine locales are alternates of one another, not nine separate pages, so
 * each entry points at the English URL and carries the other eight as
 * <xhtml:link rel="alternate">. That matches the `alternates.languages` the
 * pages already emit in their own metadata, and keeps the file at ~87 entries
 * instead of ~800 near-identical ones.
 *
 * The hreflang keys come from `localeLabels`, so the sitemap can never drift
 * from the tags on the pages — note zh is advertised as 'zh-Hans', not 'zh'.
 */

type Route = {
  /** Appended to `/<locale>`; '' is the locale home page. */
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}

/**
 * The indexable routes under app/[locale]. `careers/applications` is
 * deliberately absent — it is the manage-mode applicant inbox, and robots.ts
 * disallows it as well.
 */
const ROUTES: Route[] = [
  { path: '', priority: 1, changeFrequency: 'monthly' },
  { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/apps', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/ceo', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/events', priority: 0.8, changeFrequency: 'monthly' },
  // Roles are edited from the site itself, so this one turns over fastest.
  { path: '/careers', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  // Indexable, but it should never outrank a page that sells something.
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
]

/**
 * Build time. Every deploy rebuilds every page, so there is no per-page
 * modification date to report that would be more truthful than this one.
 */
const lastModified = new Date()

function entry({ path, priority, changeFrequency }: Route): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/${defaultLocale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [localeLabels[l].hreflang, `${SITE_URL}/${l}${path}`])
        ),
        // Whoever matches none of the nine gets English.
        'x-default': `${SITE_URL}/${defaultLocale}${path}`,
      },
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map(entry),
    ...PRODUCTS.map((product) =>
      entry({
        path: `/shop/${product.slug}`,
        priority: 0.7,
        changeFrequency: 'monthly',
      })
    ),
  ]
}
