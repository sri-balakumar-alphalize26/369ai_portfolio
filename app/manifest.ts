import type { MetadataRoute } from 'next'

/**
 * There was no manifest at all before this, so an installed shortcut fell back
 * to whatever the browser could scrape.
 *
 * Deliberately minimal: this is a marketing site, not an installable app, so
 * `display: 'browser'` keeps an added-to-home-screen shortcut opening in the
 * normal browser chrome rather than pretending to be standalone. The maskable
 * icon is the only reason the file has to exist — `app/icon.png` and
 * `app/apple-icon.png` cover everything else through the file conventions.
 *
 * Not localised: a manifest is one document for the origin, and `start_url`
 * has to pick a locale. English is the default, and the middleware redirects
 * from there anyway.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '369AI — Intelligent POS, ERP & Automation',
    short_name: '369AI',
    start_url: '/en',
    display: 'browser',
    background_color: '#ffffff',
    // The brand blue, matching --color-brand-700 in globals.css.
    theme_color: '#006090',
    icons: [
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
