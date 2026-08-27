import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { APPS } from '@/content/apps'

/**
 * APPS with hasIcon resolved against public/ — server-side (build/request
 * time), so a dropped-in icon file lights up on the next build and the
 * client never needs a broken-image fallback path. Shared by the /apps
 * page and the home-page stack section.
 */
export function appsWithIcons() {
  return APPS.map((a) => ({
    ...a,
    hasIcon: existsSync(join(process.cwd(), 'public', a.icon)),
  }))
}
