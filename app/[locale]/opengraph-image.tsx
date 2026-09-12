import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { locales } from '@/i18n/routing'

/**
 * The card that renders when a link is pasted into WhatsApp, LinkedIn, Slack
 * or X. The layout declared openGraph but carried no `images`, so every share
 * was a bare grey box — which matters here more than it does for most sites,
 * because WhatsApp is how this business actually circulates its links.
 *
 * PLACEMENT IS LOAD-BEARING — this has to sit beside layout.tsx, not at the
 * app root, for two separate reasons:
 *
 *   1. layout.tsx declares its own `openGraph`. Metadata resolves per segment,
 *      so that declaration replaces the root segment's — and an image file at
 *      the root never reaches og:image. (twitter:image did arrive, because
 *      nothing declares `twitter`, which is what makes the breakage look
 *      half-working rather than obviously wrong.)
 *   2. proxy.ts matches every path without a file extension, so a root
 *      /opengraph-image is locale-redirected to /en/opengraph-image and 404s.
 *      robots.txt and sitemap.xml escape this only by having a dot in them.
 *
 * The cost is nine identical PNGs, one per locale, which is the right trade.
 * The text stays English on purpose: a share card is usually seen by someone
 * who has not chosen a locale yet.
 *
 * No custom font is loaded. next/font/google is build-time only and cannot
 * feed ImageResponse, and there are no font files in the repo — so this uses
 * the default face that next/og ships with.
 */

export const alt = '369AI — Intelligent POS, ERP & Automation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Without this the route is rendered on demand, and every crawler that fetches
 * a share preview re-rasterises the PNG. Nine builds once is cheaper.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Image() {
  /**
   * The light ground is the logo's requirement, not a style preference: the
   * mark is blue-on-transparent with a pale halo, drawn for a white page, and
   * it disappears into the brand gradient. logo-white.png is NOT the white
   * cut of this logo — it is the NEX GENN POS mark, used nowhere else on the
   * site. The gradient survives as the base rule, where nothing sits on it.
   *
   * 353x334, so height 160 gives width 169.
   */
  const logo = await readFile(
    join(process.cwd(), 'public', 'images', 'brand', 'logo-369ai.png')
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          // --color-surface-alt, so the card is not a flat white rectangle in
          // a chat thread that is already white.
          backgroundColor: '#f4f9fc',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: 80,
          }}
        >
          {/* next/image cannot be used here: ImageResponse renders through
              satori, which understands plain elements only. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={169} height={160} alt="" />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 64,
                fontWeight: 700,
                // --color-ink
                color: '#0b1620',
                lineHeight: 1.15,
                letterSpacing: -1.5,
              }}
            >
              {'Intelligent POS, ERP & Automation'}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                // --color-slate-muted
                color: '#5b7183',
                marginTop: 24,
              }}
            >
              {'369ai.biz  ·  India  ·  Oman  ·  UAE  ·  USA'}
            </div>
          </div>
        </div>

        {/* --brand-gradient from app/globals.css, as a base rule. */}
        <div
          style={{
            display: 'flex',
            height: 16,
            width: '100%',
            backgroundImage:
              'linear-gradient(115deg, #006090 0%, #1890c0 45%, #30a8c0 70%, #60c0d8 100%)',
          }}
        />
      </div>
    ),
    size
  )
}
