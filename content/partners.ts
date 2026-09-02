/**
 * The "Trusted Partners" logo row on the home page.
 *
 * Company names are brand names and stay untranslated across all seven
 * locales (site policy, as in apps.ts). They double as each logo's alt text,
 * so this section needs no catalog keys of its own beyond the existing
 * `home.partnersTitle` heading — which shipped translated long ago but was
 * never rendered by anything until now.
 *
 * Kept as plain serializable data (idiom: technologies.ts, offices.ts).
 *
 * `w`/`h` are the real file dimensions, which next/image needs for intrinsic
 * sizing. They are deliberately not uniform: these marks run from 0.73
 * (DANAT) to 5.61 (NEX GENN POS), so TrustedPartners contains each inside a
 * shared fit-box instead of sizing by height alone.
 *
 * `scale` is the optical correction the fit-box cannot make on its own. A box
 * equalises bounding boxes, not perceived weight: Odoo is a short wide
 * wordmark that hits the box's full width and reads oversized, while NEX GENN
 * POS is so wide (5.61) that fitting it leaves it a thin 34px strip beside
 * 96px-tall neighbours. The values below were set by rendering the row and
 * comparing, not guessed.
 *
 * Source files were trimmed to their alpha bounding box and capped at 600px.
 * Odoo needed real repair: it shipped as RGB with a flat white ground and no
 * alpha channel at all, so it rendered as a white box on the tinted section.
 * That is fixed in the committed PNG — re-deriving it from the original will
 * reintroduce it.
 *
 * DANAT was later replaced from a supplied `danat_main_logo.png` that was in
 * fact WebP wearing a .png extension, 500x500 with the mark occupying only the
 * middle 237x325. Committed as a real PNG trimmed to that bounding box: had the
 * padding been left on, object-contain would have fitted the empty margin to
 * the box and drawn DANAT about a third smaller than its neighbours.
 *
 * 369 ai.Biz is deliberately absent: this row is third-party proof, and the
 * visitor is already on 369ai — its logo lives in the header. The group is
 * represented by Alphalize (parent) and DANAT instead.
 */
export type Partner = {
  /** Company name — untranslated, and used as the logo's alt text. */
  name: string
  logo: string
  w: number
  h: number
  /** Optical correction; see the note above. Overflows the fit-box by design. */
  scale?: number
}

export const PARTNERS: Partner[] = [
  { name: 'Odoo', logo: '/images/partners/odoo.png', w: 403, h: 129, scale: 0.85 },
  { name: 'Alphalize', logo: '/images/partners/alphalize.png', w: 600, h: 506 },
  { name: 'DANAT Group', logo: '/images/partners/danat.png', w: 237, h: 325 },
  { name: 'NEX GENN POS', logo: '/images/partners/nexgenn-pos.png', w: 600, h: 107, scale: 1.3 },
]
