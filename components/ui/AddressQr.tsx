'use client'

import { QRCodeSVG } from 'qrcode.react'

/**
 * An office's Google Maps deep link, as a scannable QR code.
 *
 * Client-side because qrcode.react renders with hooks and ships no
 * 'use client' of its own — keeping that boundary on this leaf lets the
 * contact page itself stay a server component.
 *
 * The code is wrapped in the same link it encodes: a visitor on a phone scans
 * it, a visitor on a desktop (who can't scan their own screen) clicks it, and
 * both land on the same map.
 */
export function AddressQr({
  url,
  title,
  size = 116,
}: {
  /** The Google Maps URL to encode — build it with mapsUrl() from content/offices. */
  url: string
  /** Accessible name, e.g. "Directions to 369AI Sharjah". */
  title: string
  size?: number
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="inline-flex shrink-0 rounded-card border border-surface-line bg-white p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
    >
      <QRCodeSVG
        value={url}
        size={size}
        // M tolerates a scuffed print or an off-angle camera without inflating
        // the module count the way H would.
        level="M"
        // The spec's 4-module quiet zone, halved — the padding above makes up
        // the rest, and scanners still lock on.
        marginSize={2}
        bgColor="#ffffff"
        fgColor="#0f2b3d"
        title={title}
      />
    </a>
  )
}
