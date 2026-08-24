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

/* First-visit loading screen — one raw-HTML island. Kept as a single
   dangerouslySetInnerHTML block so React never reconciles inside it, and the
   <script> stays INSIDE the island: React 19 deliberately renders any
   client-created <script> inert, so a separately rendered script element
   would never execute on a client re-render either. Resurrection of the
   overlay (RSC refresh, locale-switch remount, mismatch recovery, Fast
   Refresh) re-injects this HTML with the script inert — that is neutralized
   by: (a) the persistent #pl-shield style the script installs on dismissal,
   (b) the dismiss logic re-querying the current #page-loader node, and
   (c) a pure-CSS 6s self-hide animation as a no-JS failsafe.
   Module scope keeps the { __html } object identity stable so react-dom's
   updateProperties (identity compare, then unconditional innerHTML reset)
   never re-injects the island on re-renders within one RSC payload. */
const LOADER_CSS =
  '<style>#page-loader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--color-surface-alt,#f4f9fc);transition:opacity .45s ease,visibility .45s;animation:pl-hide .45s ease 6s forwards}@keyframes pl-hide{to{opacity:0;visibility:hidden}}#page-loader.done{opacity:0;visibility:hidden}#page-loader .mark{display:block;transition:transform .45s ease}#page-loader.done .mark{transform:scale(.85)}@media (max-width:767px){#page-loader img{width:60px;height:60px}}@media (prefers-reduced-motion:reduce){#page-loader{transition-duration:1ms;animation-duration:1ms}#page-loader .mark{transition:none}}</style>'

const LOADER_MARKUP =
  '<div id="page-loader" role="status" aria-live="polite" aria-label="Loading"><span class="mark"><img src="/images/brand/369-loader.svg" alt="" width="72" height="72"></span></div>'

const LOADER_SCRIPT =
  '<script>(function(){var d=document,l=d.getElementById("page-loader");if(!l)return;function shield(){if(!d.getElementById("pl-shield")){var s=d.createElement("style");s.id="pl-shield";s.textContent="#page-loader{display:none!important}";d.head.appendChild(s)}}function drop(){var n=d.getElementById("page-loader");if(n&&n.parentNode)n.parentNode.removeChild(n);if(l.parentNode)l.parentNode.removeChild(l)}var seen=false;try{seen=!!sessionStorage.getItem("369:seen")}catch(e){}if(seen){shield();drop();return}var done=false;function dismiss(){if(done)return;done=true;try{sessionStorage.setItem("369:seen","1")}catch(e){}var n=d.getElementById("page-loader")||l;n.classList.add("done");var removed=false;function rm(){if(removed)return;removed=true;shield();drop()}n.addEventListener("transitionend",rm);setTimeout(rm,600)}if(d.readyState==="complete"){dismiss()}else{window.addEventListener("load",dismiss)}setTimeout(dismiss,6000)})();</script>'

const LOADER_ISLAND = { __html: LOADER_CSS + LOADER_MARKUP + LOADER_SCRIPT }

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
        {/* First-visit loading screen island — see LOADER_* constants above.
            suppressHydrationWarning: the parse-time script may legally mutate
            the island (seen fast path / .done class) before hydration; React
            adopts the innerHTML content as-is and this silences the dev-only
            diff warning. */}
        <div suppressHydrationWarning dangerouslySetInnerHTML={LOADER_ISLAND} />

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
