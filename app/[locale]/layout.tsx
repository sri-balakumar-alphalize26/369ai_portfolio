import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Instrument_Sans, Space_Grotesk } from 'next/font/google'
import { routing, isRtl, localeLabels, locales } from '@/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { RouteLoader } from '@/components/layout/RouteLoader'
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
  '<style>#page-loader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--color-surface-alt,#f4f9fc);transition:opacity .45s ease,visibility .45s;animation:pl-hide .45s ease 8s forwards}@keyframes pl-hide{to{opacity:0;visibility:hidden}}#page-loader.done{opacity:0;visibility:hidden}#page-loader .lp-wrap{position:relative;width:180px;height:170px}#page-loader .lp-wrap img{display:block;width:180px;height:170px}#page-loader .lp-ghost{filter:grayscale(1);opacity:.22}#page-loader .lp-water{position:absolute;left:0;right:0;bottom:0;height:0;overflow:hidden}#page-loader .lp-water img{position:absolute;left:0;bottom:0}#page-loader .lp-wave{position:absolute;left:0;top:-1px;width:200%;height:12px;animation:lp-drift 2.2s linear infinite}@keyframes lp-drift{to{transform:translateX(-50%)}}@media (max-width:767px){#page-loader .lp-wrap,#page-loader .lp-wrap img{width:140px;height:132px}}@media (prefers-reduced-motion:reduce){#page-loader{transition-duration:1ms;animation-duration:1ms}#page-loader .lp-wave{animation:none}}</style>'

/* Water-fill: two copies of the logo stacked. The ghost (grey, faint) is
   always fully visible; the colour copy sits bottom-anchored inside
   .lp-water, whose height is the water level — the copy keeps the same
   fixed size, so it stays registered with the ghost while the container
   crops it from the top. The wave is an inline SVG strip painted in the
   overlay background colour that carves a drifting sine into the
   waterline (inline, not mask-image: masks from image URLs silently hide
   the element when the source cannot load). */
const LOADER_MARKUP =
  '<div id="page-loader" role="status" aria-live="polite" aria-label="Loading"><div class="lp-wrap"><img class="lp-ghost" src="/images/brand/logo-369ai.png" alt="" width="353" height="334"><div class="lp-water"><img src="/images/brand/logo-369ai.png" alt="" width="353" height="334"><svg class="lp-wave" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 Q7.5 0 15 6 T30 6 T45 6 T60 6 T75 6 T90 6 T105 6 T120 6 V0 H0 Z" fill="var(--color-surface-alt,#f4f9fc)"></path></svg></div></div></div>'

/* Fill timing: eases to 88% on its own so a slow page still looks like it
   is making progress, completes only when window.load fires, holds the
   full-colour logo for 1s, then fades. The 7s failsafe dismisses it
   regardless — a hung asset must never trap anyone behind the animation
   (the CSS pl-hide animation above backstops even that at 8s, for the
   no-JS case). */
const LOADER_SCRIPT =
  '<script>(function(){var d=document,l=d.getElementById("page-loader");if(!l)return;function shield(){if(!d.getElementById("pl-shield")){var s=d.createElement("style");s.id="pl-shield";s.textContent="#page-loader{display:none!important}";d.head.appendChild(s)}}function drop(){var n=d.getElementById("page-loader");if(n&&n.parentNode)n.parentNode.removeChild(n);if(l.parentNode)l.parentNode.removeChild(l)}var seen=false;try{seen=!!sessionStorage.getItem("369:seen")}catch(e){}if(seen){shield();drop();return}var rmo=false;try{rmo=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}var w=l.querySelector(".lp-water");function lvl(p,ms){if(!w)return;w.style.transition=rmo||!ms?"none":"height "+ms+"ms cubic-bezier(.22,1,.36,1)";w.style.height=p+"%"}requestAnimationFrame(function(){requestAnimationFrame(function(){lvl(88,2600)})});var done=false;function dismiss(){if(done)return;done=true;try{sessionStorage.setItem("369:seen","1")}catch(e){}var n=d.getElementById("page-loader")||l;n.classList.add("done");var removed=false;function rm(){if(removed)return;removed=true;shield();drop()}n.addEventListener("transitionend",rm);setTimeout(rm,600)}function finish(){lvl(100,rmo?0:450);setTimeout(dismiss,rmo?0:1450)}if(d.readyState==="complete"){finish()}else{window.addEventListener("load",finish)}setTimeout(dismiss,7000)})();</script>'

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
            <RouteLoader />
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
