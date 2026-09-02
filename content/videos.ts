/**
 * Videos from 369AI's own YouTube channel, "Shan on Tech"
 * (https://www.youtube.com/@shanontech4849).
 *
 * Titles here are cleaned-up versions of the source titles — the originals name
 * the speakers, and we deliberately do not assign names or job titles on the
 * site until the company confirms them.
 *
 * Two of the six are credited on YouTube to Mr. Sudheer Nair and Sandosh
 * Abraham, so they belong to the company rail on the home page and stay off
 * the Managing Director's own page — see CEO_TALKS below.
 */
export type Video = {
  id: string
  title: string
  /** Shown under the title on the card. */
  note?: string
  /** View count from the channel feed, used to order the rail. */
  views?: number
}

export const YOUTUBE_CHANNEL = 'https://www.youtube.com/@shanontech4849'

/**
 * "From our leadership" — the speech series, ordered most-watched first.
 * These are the channel's strongest performers: six of its top seven videos.
 */
export const LEADERSHIP_VIDEOS: Video[] = [
  { id: '7F0eXbWJFJo', title: 'Motivational Speech — Part 1', note: 'Leadership address', views: 2090 },
  { id: '-hUlpwDzVNo', title: 'Mind Management — Part 7', note: 'Corporate training', views: 1377 },
  { id: 'DW8rEwC7p_s', title: 'Motivational Speech — Part 2', note: 'Leadership address', views: 1247 },
  { id: 'REArQiiviuo', title: 'Mind Management — Part 4', note: 'Corporate training', views: 1127 },
  { id: 'RjaOCsnT5P4', title: 'Mind Management — Part 5', note: 'Corporate training', views: 1118 },
  { id: '10-iIL1DIpM', title: 'Mind Management — Part 6', note: 'Corporate training', views: 1037 },
]

/**
 * The /ceo rail: the Mind Management corporate-training series only. The two
 * "Motivational Speech" parts are another speaker's, so naming them as his
 * would be wrong — the home page still carries all six.
 */
export const CEO_TALKS: Video[] = LEADERSHIP_VIDEOS.filter((v) =>
  v.title.startsWith('Mind Management')
)

/**
 * Compact view count: 2090 -> "2.1K". The word "views" is locale text and
 * lives in the message catalogs (videos.views), rendered by the component.
 */
export function viewLabel(views?: number) {
  if (!views) return null
  return views >= 1000 ? `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${views}`
}

/** Kept for a future "Company moments" rail. */
export const COMPANY_VIDEOS: Video[] = [
  { id: 'c3Dhvw_0_GA', title: 'Danat Technology Grand Inauguration', note: '2023' },
  { id: 'iPsPmWRouIc', title: 'Qatar Press Meet', note: '2023' },
  { id: 'DB0RqFmsukU', title: 'Computer Supermarket Opening', note: '2022' },
  { id: 'UX1vnJVHwW4', title: 'Robotic Juice Parlour', note: 'Robotics in the field' },
  { id: '9aI-pD1WVOk', title: 'Our Happy Customer — City Talk', note: 'Customer story' },
  { id: 'i8MUQI6uivE', title: 'Free Course — First Batch Placed', note: 'Training & placement' },
]

/**
 * Served from our own origin, not i.ytimg.com.
 *
 * Fetching a thumbnail from Google means the browser connects to Google, which
 * hands over the visitor's IP and user agent — on page load, before anyone has
 * asked to watch anything. Self-hosting keeps that request on our domain, so
 * Google is only reached when someone presses play, which `embedUrl` below
 * already handles without cookies.
 *
 * The files are `hqdefault.jpg` copies under public/images/videos, one per id in
 * this file. They are a snapshot: re-download if a video's thumbnail changes on
 * YouTube, and add one whenever a video is added here or the card renders a 404.
 */
export function thumbnailUrl(id: string) {
  return `/images/videos/${id}.jpg`
}

/** Privacy-preserving embed host — no cookies until the visitor presses play. */
export function embedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}

export function watchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}
