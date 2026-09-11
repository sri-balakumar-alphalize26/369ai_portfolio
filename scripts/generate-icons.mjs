/**
 * Builds the favicon set from one wide source.
 *
 * public/images/brand/icon-source.png is 989x618 — the 369 mark with its
 * growth arrow, on transparency. Favicons are square, so the artwork is
 * contained on a square canvas rather than cropped; cropping to a square would
 * take the tip off the arrow, which is half the logo.
 *
 * Two grounds, deliberately:
 *   - transparent for the browser-tab icon, which sits on the browser's own
 *     chrome and should not carry a tile of its own.
 *   - solid white for the Apple touch icon, because iOS composites a
 *     transparent one onto BLACK, and for the Android maskable tile, which has
 *     no ground of its own either.
 *
 * Outputs land on Next's file conventions (app/icon.png, app/apple-icon.png),
 * so the <link> tags are emitted for us — nothing to hand-write in metadata.
 *
 * One-off. Not wired into `build`: the source changes about never, and the
 * outputs are committed. Re-run with `node scripts/generate-icons.mjs` if the
 * logo ever changes.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'public/images/brand/icon-source.png')

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

/**
 * `inset` is the share of the square left empty around the artwork.
 * A maskable icon needs a fat one: Android crops to a circle and anything
 * outside the middle ~80% can be shaved off.
 */
async function icon({ out, size, background, inset }) {
  const box = Math.round(size * (1 - inset * 2))
  const art = await sharp(SOURCE)
    .resize(box, box, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(join(ROOT, out))

  console.log(`${out}  ${size}x${size}`)
}

mkdirSync(join(ROOT, 'public/icons'), { recursive: true })

// A little breathing room, so the mark is not flush to the edge at 16px.
await icon({ out: 'app/icon.png', size: 512, background: TRANSPARENT, inset: 0.06 })
await icon({ out: 'app/apple-icon.png', size: 180, background: WHITE, inset: 0.1 })
await icon({ out: 'public/icons/maskable-512.png', size: 512, background: WHITE, inset: 0.2 })
