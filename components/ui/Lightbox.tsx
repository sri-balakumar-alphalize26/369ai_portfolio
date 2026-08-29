'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X } from 'lucide-react'

/**
 * Click-to-enlarge for a card image: the thumbnail is a button; pressing it
 * opens the picture large over a blurred, dimmed page. Closes on the X, the
 * backdrop, or Escape; page scroll is locked meanwhile.
 *
 * Portalled to <body> deliberately (MobilePanel idiom): the card's animated
 * children carry `translate` transitions, and a transformed ancestor would
 * become the containing block for the fixed overlay and trap it inside the
 * card.
 */
export function Lightbox({
  src,
  full,
  alt,
  sizes,
  fit = 'contain',
  openLabel,
  closeLabel,
}: {
  src: string
  /** Optional other picture for the overlay (e.g. the untouched original). */
  full?: string
  alt: string
  sizes: string
  /** Thumbnail fit. The overlay is always contained — enlarging must never crop. */
  fit?: 'cover' | 'contain'
  openLabel: string
  closeLabel: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        className="relative block h-full w-full cursor-zoom-in"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={fit === 'cover' ? 'object-cover' : 'object-contain'}
        />
      </button>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              className="lightbox-in fixed inset-0 z-[80] flex items-center justify-center bg-brand-950/70 p-4 backdrop-blur-md"
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              {/* Stop the click from reaching the backdrop so the picture
                  itself can be clicked without closing. */}
              <div
                className="relative h-[85vh] w-[90vw] max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src={full ?? src} alt={alt} fill sizes="90vw" className="object-contain" priority />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
