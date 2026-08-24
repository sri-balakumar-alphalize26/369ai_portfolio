/**
 * Route loading state — Next.js shows this automatically while a page's
 * server payload streams in during navigation.
 *
 * The spinner is the client-supplied 369 loader (files.zip): a plain <img>
 * on purpose — the animation is CSS embedded in the SVG itself, spins fine
 * from an <img> tag, and carries its own prefers-reduced-motion handling.
 * min-h keeps the footer from jumping up while the page body is pending.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-24">
      {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG; next/image would inline-optimize it and can strip the embedded CSS animation */}
      <img
        src="/images/brand/369-loader.svg"
        alt=""
        aria-label="Loading"
        role="status"
        width={72}
        height={72}
        className="h-18 w-18"
      />
    </div>
  )
}
