/**
 * X/Twitter reads its own tags rather than falling back to og:image, and the
 * site emitted no twitter:* metadata at all. Same card, so this is a re-export
 * of the Open Graph route rather than a second design to keep in sync.
 */
export { default, alt, size, contentType, generateStaticParams } from './opengraph-image'
