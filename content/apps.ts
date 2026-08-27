/**
 * The ten in-house 369AI mobile apps shown on the /apps page.
 *
 * Names are product names and stay untranslated across all seven locales
 * (site brand-name policy) — every other string on the page lives in the
 * `appsPage` namespace of the message catalogs, keyed by `id`.
 *
 * Kept as plain serializable data (idiom: offices.ts, technologies.ts)
 * because the array crosses the server→client boundary into AppsStack.
 */
export type AppEntry = {
  /** camelCase id — doubles as the appsPage.items.* message key AND the icon filename. */
  id: string
  /** Product name — untranslated across all locales. */
  name: string
  /** Two-letter monogram shown on the gradient tile until the real icon lands. */
  initials: string
  /**
   * Expected icon slot. The files are pending from the user — the page checks
   * for them at build time and falls back to the monogram tile, so delivered
   * icons need only be dropped in here (no code change).
   */
  icon: string
  /**
   * Complete Tailwind gradient literals — the v4 scanner reads whole class
   * names out of source files, so these must never be assembled dynamically.
   */
  tile: string
}

export const APPS: AppEntry[] = [
  { id: 'alphalize',      name: '369aiAlphalize',     initials: 'AL', icon: '/images/apps/alphalize.png',      tile: 'from-brand-700 to-brand-500' },
  { id: 'attendance',     name: '369 Attendance',     initials: 'AT', icon: '/images/apps/attendance.png',     tile: 'from-sky-600 to-cyan-400' },
  { id: 'chats',          name: '369Chats',           initials: 'CH', icon: '/images/apps/chats.png',          tile: 'from-emerald-600 to-teal-400' },
  { id: 'kraKpi',         name: 'KRA KPI',            initials: 'KK', icon: '/images/apps/kraKpi.png',         tile: 'from-violet-600 to-purple-400' },
  { id: 'showroomCheck',  name: '369 Showroom Check', initials: 'SC', icon: '/images/apps/showroomCheck.png',  tile: 'from-rose-600 to-pink-400' },
  { id: 'priceChecker',   name: 'Price Checker',      initials: 'PC', icon: '/images/apps/priceChecker.png',   tile: 'from-amber-500 to-orange-400' },
  { id: 'restaurant',     name: 'Restaurant',         initials: 'RE', icon: '/images/apps/restaurant.png',     tile: 'from-red-600 to-rose-400' },
  { id: 'spa',            name: 'Spa',                initials: 'SP', icon: '/images/apps/spa.png',            tile: 'from-fuchsia-600 to-pink-400' },
  { id: 'toolManagement', name: 'Tool Management',    initials: 'TM', icon: '/images/apps/toolManagement.png', tile: 'from-slate-700 to-slate-500' },
  { id: 'vanSale',        name: 'Van Sale',           initials: 'VS', icon: '/images/apps/vanSale.png',        tile: 'from-indigo-600 to-blue-400' },
]
