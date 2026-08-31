/**
 * The Managing Director's page (/[locale]/ceo).
 *
 * His name, the registered company name and the event names live here
 * untranslated — brand policy — while every sentence written about him lives
 * in the message catalogs. The award photo and clip are the same files the
 * Events page ships: there the award is a company event, here it is his
 * recognition, so the media is shared and the copy is not.
 *
 * This page links nowhere: the LinkedIn post announcing the award is reached
 * from the BizConnect entry in content/events.ts.
 */
export const CEO = {
  name: 'Shan Sahib',
  company: 'Alphalize Technologies Private Limited',
  /** Hero portrait; null falls back to the monogram tile. */
  portrait: '/images/ceo/portrait.jpg' as string | null,
  award: {
    /**
     * Each tile names its own alt key in the `ceo` namespace,
     * and carries its photo's real aspect ratio — the frame matches the
     * picture, so nothing is cropped or letterboxed.
     */
    images: [
      {
        // Renamed rather than overwritten: the old trophy.jpg URL still had
        // the with-background photo cached in browsers and in Next's image
        // cache. Same file the Events page ships (content/events.ts).
        src: '/images/events/bizconnect-2026/award-trophy.jpg',
        alt: 'trophyAlt',
        ratio: '800 / 1200',
        shine: true,
      },
      {
        src: '/images/ceo/moment.jpg',
        alt: 'momentAlt',
        ratio: '1600 / 1029',
        shine: false,
      },
    ],
    video: '/videos/events/bizconnect-2026/award.mp4',
  },
}
