/**
 * The ERP module, POS feature and how-it-works lists behind the /products page.
 *
 * These are message keys, not copy — every title and body lives in the
 * `products` namespace of the catalogs (`products.modules.<key>.{t,b}`,
 * `products.pos.<key>.{t,b}`, `products.steps.<key>.{t,b}`), so the lists
 * stay translation-agnostic and the order here is the order on the page.
 *
 * They moved out of the page because the assistant reads them too: its
 * knowledge index is built from the same keys, so a module added to the site
 * becomes answerable in the chat bubble without a second edit. Two copies of
 * this list would silently drift the moment one grew.
 *
 * Kept as plain string arrays (idiom: apps.ts, technologies.ts).
 */

/** The ERP modules, in page order. */
export const ERP_MODULES = [
  'posScale', 'toolsRental', 'mobileRepair', 'posInvoice', 'posLoyalty',
  'kraKpi', 'privilege', 'attendance', 'showroom', 'signage',
  'pharmacy', 'credit', 'intercompany', 'offlineSync', 'vehicleTracking',
] as const

/** The six headline POS features. */
export const POS_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const

/** The four "how it works" steps. */
export const STEPS = ['s1', 's2', 's3', 's4'] as const
