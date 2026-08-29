import { Building2, Handshake, Store, type LucideIcon } from 'lucide-react'

/**
 * Company milestones shown on the About page. Copy lives in the `about`
 * namespace of the catalogs (about.milestones.<key>.*) — rewritten for the
 * site, not the LinkedIn captions. Media is filed one folder per page
 * (public/videos/about-us, public/images/about-us); the expo teaser borrows
 * its poster from the Events page's folder.
 */
export type Milestone = {
  key: 'office' | 'partnership' | 'expo'
  Icon: LucideIcon
  /** Video under public/videos — shown instead of photos when present. */
  video?: string
  /** Photos; empty (and no video) → brand tile with the glyph. */
  images: string[]
  /** The LinkedIn post behind the milestone (renders the LinkedIn link). */
  linkedin?: string
  /** Internal page for the full story (renders a "Learn more" link instead). */
  href?: string
}

export const MILESTONES: Milestone[] = [
  {
    key: 'office',
    Icon: Building2,
    video: '/videos/about-us/office-inauguration-2025.mp4',
    images: [],
    linkedin: 'https://www.linkedin.com/feed/update/urn:li:activity:7393506273406791681',
  },
  {
    key: 'partnership',
    Icon: Handshake,
    images: ['/images/about-us/odoo-partnership.jpg'],
    linkedin: 'https://www.linkedin.com/feed/update/urn:li:activity:7406920123594223616',
  },
  {
    key: 'expo',
    Icon: Store,
    images: ['/images/events/expo-2025/poster.jpg'],
    href: '/events#expo2025',
  },
]
