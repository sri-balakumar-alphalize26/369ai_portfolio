/**
 * Where the idle advertisement may appear, and what it says there
 * (components/promo/IdlePromo.tsx).
 *
 * This map is an ALLOW-LIST, not a list of exceptions: a section that is not
 * named here never shows the ad. One list rather than a trigger list and a
 * block list that drift apart — the pages it must stay off are the ones with
 * a form (contact, careers), the ones someone is reading (ceo, events), the
 * ones someone is buying on (shop and its product pages), the legal notice,
 * and /apps and /products, where there is nothing left to promote.
 *
 * Keys are the first path segment after the locale. The home page is ''.
 */
export type PromoKind = 'apps' | 'solutions' | 'brochure'

export const PROMO_BY_SECTION: Record<string, PromoKind> = {
  '': 'apps',
  services: 'apps',
  solutions: 'solutions',
  about: 'brochure',
}

/**
 * Which of the ten apps the `apps` card shows. Its name comes from
 * content/apps.ts and its one-line pitch from appsPage.items.<id>.tagline,
 * already translated in all seven locales — so changing this id needs no
 * translation work at all.
 */
export const PROMO_APP_ID = 'alphalize'

/** The kind for a path section, or null when the ad must not appear. */
export function promoFor(section: string): PromoKind | null {
  return PROMO_BY_SECTION[section] ?? null
}
