'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/lib/cn'

/**
 * The trophy shots, tucked into the corner of the award clip like a print
 * left on the table. Two pictures of the same trophy share the slot and
 * cross-fade; arrows step between them, the tag counts them, and clicking
 * opens the picture full size.
 *
 * The arrows sit above the picture and stop their clicks there, so stepping
 * through never opens the overlay by accident.
 */
export function AwardCard({
  srcs,
  labels,
  prevLabel,
  nextLabel,
  openLabel,
  closeLabel,
}: {
  srcs: string[]
  labels: string[]
  prevLabel: string
  nextLabel: string
  openLabel: string
  closeLabel: string
}) {
  const [i, setI] = useState(0)
  const many = srcs.length > 1
  const step = (d: number) => setI((n) => (n + d + srcs.length) % srcs.length)

  return (
    <div className="floor__award">
      {srcs.map((src, n) => (
        <div key={src} className={cn('floor__slide', n === i && 'is-on')}>
          {/* Only the visible slide is interactive, so the overlay always
              opens the picture on show. */}
          {n === i ? (
            <Lightbox
              src={src}
              alt={labels[n] ?? ''}
              sizes="180px"
              fit="contain"
              openLabel={openLabel}
              closeLabel={closeLabel}
            />
          ) : (
            <Image src={src} alt="" fill sizes="180px" className="object-contain" />
          )}
        </div>
      ))}

      {many ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
            aria-label={prevLabel}
            className="floor__arrow floor__arrow--prev"
          >
            <ChevronLeft className="h-3 w-3 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
            aria-label={nextLabel}
            className="floor__arrow floor__arrow--next"
          >
            <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
          </button>
        </>
      ) : null}

      <span className="floor__award__tag">
        {labels[i]}
        {many ? ` · ${i + 1}/${srcs.length}` : null}
      </span>
    </div>
  )
}
