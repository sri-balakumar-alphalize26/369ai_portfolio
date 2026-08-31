import Image from 'next/image'
import { PARTNERS } from '@/content/partners'
import { Reveal } from '@/components/ui/Reveal'

/**
 * The partner logo row.
 *
 * Each mark sits in a fixed fit-box and is contained rather than sized by
 * height alone: the four range from 0.89 to 5.61 in aspect ratio, so tall
 * marks land on the box's height and wide ones on its width, which is the
 * only way they read at a similar weight. A few then take a `scale` nudge
 * (see content/partners.ts) — that transform deliberately overflows the box
 * without disturbing layout, and the row's gap is wider than the largest
 * overflow, so neighbours never collide. Nothing here may be given
 * `overflow-hidden` for the same reason.
 *
 * Mobile box is w-36, not w-40: Section pads px-5, leaving 350px at 390px
 * wide, and two w-40 boxes plus the gap came to 368 - so the row broke to
 * one logo per line and the section became a five-high stack.
 *
 * No greyscale-to-colour on hover: Odoo and NEX GENN POS are already
 * near-monochrome and would flatten into nothing.
 */
export function TrustedPartners() {
  return (
    <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-10 sm:gap-x-16">
      {PARTNERS.map(({ name, logo, w, h, scale }, i) => (
        <Reveal as="li" key={name} delay={i * 80}>
          <span className="flex h-20 w-36 items-center justify-center sm:h-24 sm:w-48">
            <Image
              src={logo}
              alt={name}
              width={w}
              height={h}
              sizes="192px"
              className="h-auto max-h-full w-auto max-w-full object-contain"
              style={scale ? { scale: String(scale) } : undefined}
            />
          </span>
        </Reveal>
      ))}
    </ul>
  )
}
