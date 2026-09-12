import { CONTACT, OFFICES, mapsUrl, type Office } from '@/content/offices'
import { SOCIALS } from '@/content/socials'
import { SITE_URL } from '@/lib/site'

/**
 * Organization JSON-LD for the home page.
 *
 * The careers page already ships JobPosting, which is what put the roles into
 * Google Jobs. This is the other half: the entity itself, so the six offices
 * are tied to one company rather than read as six unrelated addresses, and so
 * the logo, socials and contact details can feed a knowledge panel.
 *
 * Everything here is derived from content/offices.ts and content/socials.ts —
 * the same data the footer and the contact page render — so there is no second
 * copy of the addresses to keep in step.
 */

/**
 * The address arrays are written for display, last line first-to-go: the final
 * entry is the region/country line that PostalAddress carries in its own
 * fields, so the street lines are everything before it.
 */
function postalAddress(office: Office) {
  return {
    '@type': 'PostalAddress',
    streetAddress: office.address.slice(0, -1).join(', '),
    addressLocality: office.city,
    addressCountry: office.countryCode.toUpperCase(),
  }
}

function place(office: Office) {
  return {
    '@type': 'Place',
    name: `369AI — ${office.city}`,
    address: postalAddress(office),
    // The same Maps query the office QR codes encode.
    hasMap: mapsUrl(office.mapsQuery),
    ...(office.phones?.length ? { telephone: office.phones[0] } : {}),
  }
}

/**
 * `description` is passed in rather than hardcoded so the page can hand over
 * its own translated hero copy — the same string the layout already uses for
 * the meta description.
 */
export function organizationJsonLd(description: string) {
  // Kollam is first in OFFICES and is the head office; the rest are branches.
  const [headOffice] = OFFICES

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: '369AI',
    /**
     * The brand name is contested — 369ai.cloud, 369 AI Ventures, 369 Studio
     * and several others all rank for "369 AI", and a search for "369 ai biz"
     * returns every one of them before this site.
     *
     * `name` alone is the closed-up form, so the spaced and domain forms people
     * actually type are not matched to this entity. These are the query
     * variants, not marketing copy — do not extend this into a keyword list.
     */
    alternateName: ['369 AI', '369AIbiz', '369AI Biz', '369 AI Biz', '369ai.biz'],
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-369ai.png`,
    image: `${SITE_URL}/opengraph-image`,
    description,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: postalAddress(headOffice),
    location: OFFICES.map(place),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: CONTACT.phone,
      email: CONTACT.email,
      areaServed: [...new Set(OFFICES.map((o) => o.countryCode.toUpperCase()))],
    },
    /**
     * The footer accounts, plus the company's second YouTube channel.
     *
     * SOCIALS carries "Shan on Tech", which hosts the six videos the site
     * embeds. @369AIbiz is the other channel, and it is currently the top
     * result for the brand name — the strongest property pointing at this
     * entity, so leaving it out of sameAs threw that signal away.
     *
     * Added here rather than in content/socials.ts on purpose: that list draws
     * the footer, and two YouTube icons side by side would be wrong. This is an
     * entity signal, not a link for visitors.
     */
    sameAs: [...SOCIALS.map((s) => s.href), 'https://www.youtube.com/@369AIbiz'],
  }
}
