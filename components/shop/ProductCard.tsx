'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { categoryLabel, type ProductCardData } from '@/lib/products'
import { cn } from '@/lib/cn'

/** Arrow hit area: hidden until hover on a mouse, always shown without one. */
const ARROW =
  'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-surface-line bg-white/90 text-ink shadow-sm backdrop-blur transition-all hover:bg-white hover:text-brand-600 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'

/**
 * One product in a grid, with an inline photo carousel when the product has
 * more than one shot.
 *
 * The card is a div rather than one big anchor: arrows nested inside an <a> are
 * invalid markup and would navigate instead of paging. Instead the title holds
 * the only link and stretches over the whole card via ::after, with the arrows
 * and dots lifted above it on z-10.
 */
export function ProductCard({
  product,
  base,
  viewLabel,
  className,
}: {
  product: ProductCardData
  /** Locale prefix, e.g. "/en". */
  base: string
  viewLabel: string
  className?: string
}) {
  const t = useTranslations('shop')
  const tCat = useTranslations('categories')
  const [index, setIndex] = useState(0)
  // Fades each shot in once decoded, so a half-painted image never flashes.
  const [loaded, setLoaded] = useState(false)
  // Once the visitor pages manually, the hover image-cycle stands down.
  const touched = useRef(false)

  const category = product.categories[0]
  const images = product.images
  const many = images.length > 1

  function show(i: number) {
    setLoaded(false)
    setIndex(i)
  }

  /** Wraps, so paging past either end continues rather than dead-ending. */
  function step(delta: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    touched.current = true
    setLoaded(false)
    setIndex((i) => (i + delta + images.length) % images.length)
  }

  function jumpTo(i: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    touched.current = true
    show(i)
  }

  return (
    <div
      className={cn(
        'card-glow group relative flex h-full flex-col overflow-hidden rounded-panel border border-surface-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400',
        className
      )}
      // Hardware benefits from a second angle: hovering shows shot #2, and
      // leaving returns to the first — unless the visitor took over paging.
      onMouseEnter={() => {
        if (many && !touched.current) show(1)
      }}
      onMouseLeave={() => {
        if (many && !touched.current && index !== 0) show(0)
      }}
    >
      {/* Odoo shot these on white at every aspect ratio going, so contain
          rather than cover — cropping them crops the product. */}
      <div className="relative aspect-square w-full overflow-hidden bg-white p-5">
        {images[index] ? (
          <Image
            src={images[index]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={70}
            // Cached images can finish before React attaches onLoad — the ref
            // checks .complete so a cache hit still fades in immediately.
            ref={(el) => {
              if (el?.complete) setLoaded(true)
            }}
            onLoad={() => setLoaded(true)}
            className={cn(
              'object-contain p-2 transition-all duration-300 group-hover:scale-105',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        ) : null}

        {many ? (
          <>
            <button
              type="button"
              onClick={(e) => step(-1, e)}
              aria-label={t('prevImage')}
              className={cn(ARROW, 'start-2')}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => step(1, e)}
              aria-label={t('nextImage')}
              className={cn(ARROW, 'end-2')}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>

            <ul className="absolute bottom-2 start-3 z-10 flex items-center gap-1.5">
              {images.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={(e) => jumpTo(i, e)}
                    aria-label={t('galleryAlt', { n: i + 1 })}
                    aria-current={i === index}
                    className={cn(
                      'block h-1.5 rounded-full transition-all',
                      i === index ? 'w-4 bg-brand-500' : 'w-1.5 bg-slate-300 hover:bg-brand-400'
                    )}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-surface-line p-5">
        {category ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {categoryLabel(category, tCat)}
          </p>
        ) : null}
        <h3 className="mt-2 text-sm font-semibold leading-snug text-ink">
          {/* The only anchor on the card, stretched over the whole surface. */}
          <Link href={`${base}/shop/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-slate-muted transition-colors group-hover:text-brand-600">
          {viewLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden
          />
        </span>
      </div>
    </div>
  )
}
