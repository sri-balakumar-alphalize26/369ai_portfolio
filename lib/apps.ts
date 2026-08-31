import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { APPS, type AppEntry } from '@/content/apps'
import { PROMO_APP_ID } from '@/content/promo'

function withIcon(app: AppEntry) {
  return { ...app, hasIcon: existsSync(join(process.cwd(), 'public', app.icon)) }
}

/**
 * APPS with hasIcon resolved against public/ — server-side (build/request
 * time), so a dropped-in icon file lights up on the next build and the
 * client never needs a broken-image fallback path. Shared by the /apps
 * page and the home-page stack section.
 */
export function appsWithIcons() {
  return APPS.map(withIcon)
}

/**
 * The single app the idle advertisement features. Server-only, like the
 * above — the fs check cannot run in a client component, so the layout
 * resolves it and passes it down as a plain prop.
 */
export function promoApp() {
  const app = APPS.find((a) => a.id === PROMO_APP_ID)
  return app ? withIcon(app) : null
}
