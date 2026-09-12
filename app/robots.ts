import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * There was no robots.txt at all before this, which left two problems:
 * nothing told a crawler where the sitemap lives, and nothing kept the
 * manage-mode surface out of the index.
 *
 * The disallow list is about *indexing*, not access — the session cookie is
 * what actually protects these. It keeps them from being listed:
 *
 *   /api/                        the CV route streams application PDFs
 *   /*\/careers/applications     the applicant inbox, one path per locale
 *   /*?manage=                   the unlock parameter; ?manage=0 is already a
 *                                config redirect, but ?manage=1 is a real URL
 *                                a crawler could otherwise follow and index
 *
 * The sitemap has to be absolute — the spec requires it, and a relative path
 * is silently ignored by Google.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/*/careers/applications', '/*?manage='],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
