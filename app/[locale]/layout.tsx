import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Instrument_Sans, Space_Grotesk } from 'next/font/google'
import { routing, isRtl, localeLabels, locales } from '@/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Assistant } from '@/components/assistant/Assistant'
import '../globals.css'

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const SITE_URL = 'https://369ai.biz'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const meta = await getTranslations({ locale, namespace: 'meta' })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta('siteTitle'),
      template: '%s | 369AI',
    },
    description: t('heroBody'),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}`])
      ),
    },
    openGraph: {
      type: 'website',
      siteName: '369AI',
      title: meta('siteTitle'),
      description: t('heroBody'),
      url: `/${locale}`,
    },
    robots: { index: true, follow: true },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Required for static rendering of every locale.
  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* First-visit loading screen. One opaque HTML island via
            dangerouslySetInnerHTML: React never reconciles inside it, so the
            parse-time script can add classes and remove the node without
            triggering a hydration mismatch that would resurrect the loader
            (which is exactly what happened when these were separate React
            nodes). Style inline so it never waits on the stylesheet; the spin
            and its reduced-motion handling live inside the SVG itself. */}
        <div dangerouslySetInnerHTML={{ __html: "<style>#page-loader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--color-surface-alt,#f4f9fc);transition:opacity .45s ease,visibility .45s}#page-loader.done{opacity:0;visibility:hidden}#page-loader .mark{display:block;transition:transform .45s ease}#page-loader.done .mark{transform:scale(.85)}@media (max-width:767px){#page-loader img{width:60px;height:60px}}@media (prefers-reduced-motion:reduce){#page-loader{transition-duration:1ms}#page-loader .mark{transition:none}}</style><div id=\"page-loader\" role=\"status\" aria-live=\"polite\" aria-label=\"Loading\"><span class=\"mark\"><img src=\"/images/brand/369-loader.svg\" alt=\"\" width=\"72\" height=\"72\"></span></div><script>(function(){var l=document.getElementById(\"page-loader\");if(!l)return;var seen=false;try{seen=!!sessionStorage.getItem(\"369:seen\")}catch(e){}if(seen){l.parentNode.removeChild(l);return}var done=false;function dismiss(){if(done)return;done=true;try{sessionStorage.setItem(\"369:seen\",\"1\")}catch(e){}l.classList.add(\"done\");var removed=false;function rm(){if(removed)return;removed=true;if(l.parentNode)l.parentNode.removeChild(l)}l.addEventListener(\"transitionend\",rm);setTimeout(rm,600)}if(document.readyState===\"complete\"){dismiss()}else{window.addEventListener(\"load\",dismiss)}setTimeout(dismiss,6000)})();</script>" }} />

        <div id="app-root" className="flex min-h-full flex-col">
          <NextIntlClientProvider>
            <ScrollProgress />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Assistant />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  )
}
