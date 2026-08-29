/**
 * Events shown on /events. Copy lives in the `events` namespace of the
 * catalogs (events.items.<key>.*) — rewritten for the site, not the LinkedIn
 * captions. Media is filed one folder per event under public/images/events
 * and public/videos/events; videos are ambient loops that only load when
 * scrolled into view (AmbientVideo), so their size is paid only when watched.
 *
 * The events are listed oldest first — the roadmap rail reads left to right.
 */
export type GalleryItem = {
  /** One or more versions of the same subject; several turn the tile into a
   *  small ‹ › switcher (the trophy clean/original pair, the two posters). */
  srcs: string[]
  /** One message-key suffix per image, read from events.captions.* */
  captions?: string[]
}

export type EventEntry = {
  key: 'expo2025' | 'bizconnect2026'
  /** Lead photo beside the copy. */
  hero: string
  /** Extra photos, opened in the lightbox. */
  gallery: GalleryItem[]
  /**
   * Clips from the floor, rendered as silent loops. `key` points at the
   * heading lifted from that clip's own title card
   * (events.items.expo2025.clips.<key>); a clip without one shows no heading.
   */
  videos: { src: string; key?: string; portrait?: boolean }[]
  /**
   * LinkedIn posts. With several, they are labelled events.post1..3
   * ("Announcement", "Live demos", "Video"); a single one is events.viewPost.
   */
  posts: string[]
  /** Optional photo card tucked into the corner of a single-clip video. */
  award?: { srcs: string[]; labels: string[] }
}

const LI = 'https://www.linkedin.com/feed/update/urn:li:activity:'

export const EVENTS: EventEntry[] = [
  {
    key: 'expo2025',
    hero: '/images/events/expo-2025/expo-team.jpg',
    gallery: [],
    videos: [
      { src: '/videos/events/expo-2025/clip-1.mp4', key: 'c1', portrait: true },
      { src: '/videos/events/expo-2025/clip-2.mp4', key: 'c2', portrait: true },
      { src: '/videos/events/expo-2025/clip-3.mp4', key: 'c3', portrait: true },
      { src: '/videos/events/expo-2025/clip-4.mp4', key: 'c4', portrait: true },
    ],
    posts: [`${LI}7407416895206903808`, `${LI}7407801629690875905`, `${LI}7400511033326620672`],
  },
  {
    key: 'bizconnect2026',
    hero: '/images/events/bizconnect-2026/booth.jpg',
    gallery: [],
    videos: [{ src: '/videos/events/bizconnect-2026/award.mp4' }],
    // Sits in the corner of the award clip: the same trophy twice, stepped
    // through with arrows. Labels come from events.award.*
    award: {
      // Renamed rather than overwritten: the old trophy.jpg URL still had the
      // with-background photo cached in browsers and in Next's image cache.
      srcs: ['/images/events/bizconnect-2026/award-trophy.jpg'],
      labels: ['a1'],
    },
    posts: [`${LI}7424844057484390402`],
  },
]
