/**
 * Splits the header logo into its two animatable layers.
 *
 * The entrance in globals.css wipes the wordmark left-to-right while the arrow
 * draws upward from its own base, and the two have to run at once: the arrow
 * crosses the 6, so the wordmark layer has a notch cut out of it there. A flat
 * PNG cannot do that — hence this split.
 *
 * The cut is by colour, because that is what actually separates the two things:
 * the arrow is orange, everything else (blue digits, the grey "ai.Biz", the
 * chrome bevels) is not. The notch costs nothing extra — taking the arrow's
 * pixels out of the base layer IS the notch.
 *
 * Both layers keep the SOURCE CANVAS, so the markup can stack them at
 * `absolute inset-0` with no alignment work at all.
 *
 * One-off, like generate-icons.mjs. Outputs are committed; re-run only if the
 * logo changes: `node scripts/generate-logo-layers.mjs`.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'public/images/brand/logo-369ai.png')

/**
 * How orange a pixel is, 0..1 — a ramp, not a yes/no.
 *
 * A hard threshold has to award every anti-aliased pixel along the
 * arrow-against-6 boundary wholly to one layer, and whichever layer loses them
 * gets a visible fringe. A soft matte instead SHARES those pixels: the arrow
 * takes `m` of the alpha and the base takes `1 - m`, so the two layers add back
 * up to the original image exactly. Composited, the seam disappears.
 *
 * `r - b` is the discriminator. The orange is high-red/low-blue, the blue
 * digits the reverse, and the grey wordmark sits near zero — so the ramp is
 * placed well clear of grey and only opens up on genuine orange.
 */
const LO = 20
const HI = 70
function orangeness(r, g, b) {
  if (r < 100) return 0 // too dark to be the arrow; shadow under the digits
  if (g > r - 10) return 0 // not warm enough — yellowish chrome highlights
  const d = r - b
  if (d <= LO) return 0
  if (d >= HI) return 1
  return (d - LO) / (HI - LO)
}

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

const arrow = Buffer.alloc(data.length)
const base = Buffer.alloc(data.length)

for (let i = 0; i < data.length; i += channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
  const m = orangeness(r, g, b)

  // Colour is copied unchanged into both; only the alpha is divided. Splitting
  // the colour too would darken the shared edge pixels.
  for (let c = 0; c < 3; c++) {
    arrow[i + c] = data[i + c]
    base[i + c] = data[i + c]
  }
  arrow[i + 3] = Math.round(a * m)
  base[i + 3] = Math.round(a * (1 - m))
}

const raw = { raw: { width, height, channels } }
await sharp(arrow, raw).png().toFile(join(ROOT, 'public/images/brand/logo-arrow.png'))
await sharp(base, raw).png().toFile(join(ROOT, 'public/images/brand/logo-base.png'))

console.log(`logo-arrow.png  ${width}x${height}`)
console.log(`logo-base.png   ${width}x${height}`)
