import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * Compact indeterminate loader: the brand logo as a faint ghost with a
 * water level that rises and falls on a loop, wavy at the surface.
 * Same construction as the first-visit preloader's fill (ghost copy +
 * bottom-anchored colour copy cropped by the water container), but the
 * ripple is a clip-path polygon rather than a background-coloured SVG
 * carve, so it works over any backdrop (white page, frosted overlay).
 * Styles: globals.css `.logo-loader`. Decorative — callers put
 * role="status"/aria-label on their wrapper.
 */
export function LogoLoader({ className }: { className?: string }) {
  return (
    <span className={cn('logo-loader', className)} aria-hidden>
      <Image
        className="ll-ghost"
        src="/images/brand/logo-369ai.png"
        width={353}
        height={334}
        alt=""
      />
      <span className="ll-water">
        <Image src="/images/brand/logo-369ai.png" width={353} height={334} alt="" />
      </span>
    </span>
  )
}
