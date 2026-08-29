/**
 * Events shown on /events. Copy lives in the `events` namespace of the
 * catalogs (events.items.<key>.*) — rewritten for the site, not the LinkedIn
 * captions. Media is filed one folder per event under public/images/events
 * and public/videos/events; videos are ambient loops that only load when
 * scrolled into view (AmbientVideo), so their size is paid only when watched.
 */
export type EventEntry = {
  key: 'expo2025' | 'bizconnect2026'
  /** Lead photo beside the copy. */
  hero: string
  /** Extra photos, opened in the lightbox. */
  gallery: string[]
  /** Clips from the floor, rendered as silent loops. */
  videos: string[]
  /**
   * LinkedIn posts. With several, they are labelled events.post1..3
   * ("Announcement", "Live demos", "Video"); a single one is events.viewPost.
   */
  posts: string[]
}

const LI = 'https://www.linkedin.com/feed/update/urn:li:activity:'

export const EVENTS: EventEntry[] = [
  {
    key: 'expo2025',
    hero: '/images/events/expo-2025/stall-team.jpg',
    gallery: ['/images/events/expo-2025/booth.jpg', '/images/events/expo-2025/poster.jpg'],
    videos: [
      '/videos/events/expo-2025/announcement.mp4',
      '/videos/events/expo-2025/walkthrough.mp4',
      '/videos/events/expo-2025/clip-1.mp4',
      '/videos/events/expo-2025/clip-2.mp4',
      '/videos/events/expo-2025/clip-3.mp4',
      '/videos/events/expo-2025/clip-4.mp4',
    ],
    posts: [`${LI}7407416895206903808`, `${LI}7407801629690875905`, `${LI}7400511033326620672`],
  },
  {
    key: 'bizconnect2026',
    hero: '/images/events/bizconnect-2026/poster.jpg',
    gallery: ['/images/events/bizconnect-2026/trophy.jpg', '/images/events/bizconnect-2026/trophy-render.png'],
    videos: [],
    posts: [`${LI}7424844057484390402`],
  },
]
