'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { isRtl } from '@/i18n/routing'
import { cn } from '@/lib/cn'

/** Flyout panel size, px. Square, to match the image frame. */
const PANEL = 460

/**
 * How hard to magnify. The catalog is mostly 800px source art shown at ~570px,
 * so there is only ~1.4x of real detail to reveal — but a zoom that subtle
 * doesn't read as a zoom. These bounds are the compromise: never so weak it
 * looks broken, never so strong the 257px outliers turn to mush.
 */
const MIN_ZOOM = 1.8
const MAX_ZOOM = 3

/** A mouse, a fine pointer, and room beside the image for the panel. */
const ZOOM_MQ = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

function subscribeToZoomable(onChange: () => void) {
  const mq = window.matchMedia(ZOOM_MQ)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

type Rect = { left: number; top: number; width: number; height: number }
/** Where object-contain painted the image, and how far its pixels allow zooming. */
type Measurement = { rect: Rect; zoom: number }

/**
 * Main shot plus thumbnail strip, with Amazon-style hover magnification: the
 * cursor drives a lens over the main image and a flyout panel beside it shows
 * that region enlarged.
 *
 * On touch, pinch-zoom already does this better, and below `lg` there is no room
 * beside the image for the panel — so the whole behaviour is gated on ZOOM_MQ.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const t = useTranslations('shop')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const rtl = isRtl(locale)

  const [active, setActive] = useState(0)
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null)
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [lightbox, setLightbox] = useState(false)

  const frameRef = useRef<HTMLDivElement>(null)

  const zoomable = useSyncExternalStore(
    subscribeToZoomable,
    () => window.matchMedia(ZOOM_MQ).matches,
    () => false // never zoom during SSR — there is no pointer to go on
  )

  /**
   * object-contain letterboxes the image inside the padded frame, so the painted
   * box has to be derived rather than assumed, or the lens drifts off the art.
   */
  const measure = useCallback(() => {
    const frame = frameRef.current
    if (!frame) return

    const img = frame.querySelector('img')
    if (!img?.naturalWidth) return

    const style = getComputedStyle(frame)
    const padLeft = parseFloat(style.paddingLeft)
    const padTop = parseFloat(style.paddingTop)
    const boxW = frame.clientWidth - padLeft - parseFloat(style.paddingRight)
    const boxH = frame.clientHeight - padTop - parseFloat(style.paddingBottom)
    if (boxW <= 0 || boxH <= 0) return

    const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight)
    const width = img.naturalWidth * scale
    const height = img.naturalHeight * scale

    // Zoom to this image's own native density, clamped — a 1200px source earns
    // more magnification than a 257px one.
    const native = width ? img.naturalWidth / width : MIN_ZOOM

    setMeasurement({
      rect: {
        left: padLeft + (boxW - width) / 2,
        top: padTop + (boxH - height) / 2,
        width,
        height,
      },
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, native)),
    })
  }, [])

  // Re-measure when the frame resizes — the painted box and therefore the
  // usable zoom both change with it.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(() => measure())
    observer.observe(frame)
    return () => observer.disconnect()
  }, [measure])

  /**
   * Switching thumbnails invalidates both the lens (it points into an image no
   * longer shown) and the measurement (the next image has its own aspect ratio).
   * Done here rather than in an effect on `active` — this is the only way
   * `active` changes, and setState-in-effect would just cause a second render.
   */
  function select(index: number) {
    setActive(index)
    setLens(null)
    setMeasurement(null)
  }

  /** Step the shown image, wrapping — used by the lightbox arrows and keys. */
  const step = useCallback(
    (delta: number) => {
      setActive((i) => (i + delta + images.length) % images.length)
      setLens(null)
      setMeasurement(null)
    },
    [images.length]
  )

  // Escape closes the lightbox, arrows page it, and the page behind must not
  // scroll while it is open.
  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, step])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomable || !measurement) return
    const frame = frameRef.current
    if (!frame) return

    const { rect } = measurement
    const bounds = frame.getBoundingClientRect()
    const x = e.clientX - bounds.left - rect.left
    const y = e.clientY - bounds.top - rect.top

    // In the letterbox margin, not on the art — nothing to magnify.
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setLens(null)
      return
    }
    setLens({ x, y })
  }

  if (!images.length) return null

  const src = images[active]
  const active_ = measurement && lens && zoomable ? { ...measurement, lens } : null

  // Lens = the slice the panel is showing, so its size is the panel scaled back
  // down. Centred on the cursor, then clamped inside the art.
  let lensBox = { left: 0, top: 0, width: 0, height: 0 }
  let bgX = 0
  let bgY = 0

  if (active_) {
    const { rect, zoom } = active_
    const width = Math.min(PANEL / zoom, rect.width)
    const height = Math.min(PANEL / zoom, rect.height)
    const left = Math.min(Math.max(active_.lens.x - width / 2, 0), rect.width - width)
    const top = Math.min(Math.max(active_.lens.y - height / 2, 0), rect.height - height)
    lensBox = { left, top, width, height }
    bgX = -left * zoom
    bgY = -top * zoom
  }

  return (
    <div className="relative">
      <div
        ref={frameRef}
        onMouseMove={onMove}
        onMouseLeave={() => setLens(null)}
        onClick={() => setLightbox(true)}
        role="button"
        tabIndex={0}
        aria-label={t('viewFull')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setLightbox(true)
          }
        }}
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded-panel border border-surface-line bg-white',
          'cursor-zoom-in'
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
          onLoad={measure}
          className="object-contain p-8"
        />

        {active_ ? (
          <span
            aria-hidden
            className="pointer-events-none absolute border-2 border-brand-500/70 bg-brand-500/10"
            style={{
              left: active_.rect.left + lensBox.left,
              top: active_.rect.top + lensBox.top,
              width: lensBox.width,
              height: lensBox.height,
            }}
          />
        ) : null}
      </div>

      {/* Magnified region. Overlays the details column the way Amazon's does —
          hence the high z-index and pointer-events-none. */}
      {active_ ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-0 z-40 overflow-hidden rounded-panel border border-surface-line bg-white shadow-2xl',
            rtl ? 'end-[calc(100%+1.5rem)]' : 'start-[calc(100%+1.5rem)]'
          )}
          style={{
            width: PANEL,
            height: PANEL,
            backgroundImage: `url("${src}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${active_.rect.width * active_.zoom}px ${active_.rect.height * active_.zoom}px`,
            backgroundPosition: `${bgX}px ${bgY}px`,
          }}
        />
      ) : null}

      {lightbox && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
              onClick={() => setLightbox(false)}
              role="dialog"
              aria-modal="true"
              aria-label={name}
            >
              {/* stopPropagation so clicking the photo itself does not dismiss */}
              <div
                className="relative max-h-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={name}
                  width={1200}
                  height={1200}
                  className="max-h-[88vh] w-auto object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label={tNav('close')}
                className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      step(-1)
                    }}
                    aria-label={t('prevImage')}
                    className="absolute start-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  >
                    <ChevronLeft className="h-6 w-6 rtl:rotate-180" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      step(1)
                    }}
                    aria-label={t('nextImage')}
                    className="absolute end-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  >
                    <ChevronRight className="h-6 w-6 rtl:rotate-180" aria-hidden />
                  </button>
                  <p className="absolute bottom-5 start-1/2 -translate-x-1/2 rounded-pill bg-white/10 px-3 py-1 text-xs text-white rtl:translate-x-1/2">
                    {active + 1} / {images.length}
                  </p>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}

      {images.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-3">
          {images.map((thumb, i) => (
            <li key={thumb}>
              <button
                type="button"
                onClick={() => select(i)}
                aria-label={t('galleryAlt', { n: i + 1 })}
                aria-current={i === active}
                className={cn(
                  'relative h-20 w-20 overflow-hidden rounded-card border bg-white transition-colors',
                  i === active
                    ? 'border-brand-500 ring-1 ring-brand-500'
                    : 'border-surface-line hover:border-brand-400'
                )}
              >
                <Image
                  src={thumb}
                  alt={t('galleryAlt', { n: i + 1 })}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
