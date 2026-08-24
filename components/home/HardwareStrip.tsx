'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ProductCard } from '@/components/shop/ProductCard'
import { USE_CASES, type ProductCardData, type UseCaseId } from '@/lib/products'
import { cn } from '@/lib/cn'

const SHOW = 8

/**
 * Homepage hardware strip with use-case chip filtering and a FLIP reflow:
 * measure First, mutate, measure Last, Invert each survivor back to its old
 * spot with a transform, then Play by releasing it. Grid positions can't be
 * transitioned directly — this fakes it on the compositor.
 */
export function HardwareStrip({
  items,
  base,
}: {
  items: ProductCardData[]
  base: string
}) {
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const tu = useTranslations('useCases')

  const [useCase, setUseCase] = useState<UseCaseId | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const visible = (useCase ? items.filter((p) => p.useCases.includes(useCase)) : items).slice(
    0,
    SHOW
  )

  function pick(next: UseCaseId | null) {
    if (next === useCase) return
    const list = listRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!list || reduced) {
      setUseCase(next)
      return
    }

    // FIRST — where every current card sits.
    const first = new Map<string, DOMRect>()
    for (const li of list.children) {
      const slug = (li as HTMLElement).dataset.slug
      if (slug) first.set(slug, li.getBoundingClientRect())
    }

    setUseCase(next)

    // LAST + INVERT + PLAY, after React commits the new set.
    requestAnimationFrame(() => {
      const nowList = listRef.current
      if (!nowList) return
      for (const child of nowList.children) {
        const el = child as HTMLElement
        const slug = el.dataset.slug
        if (!slug) continue
        const was = first.get(slug)
        const is = el.getBoundingClientRect()

        if (!was) {
          // Entering card: simple fade/scale in.
          el.style.transition = 'none'
          el.style.opacity = '0'
          el.style.transform = 'scale(.94)'
          requestAnimationFrame(() => {
            el.style.transition = 'opacity .3s ease, transform .45s cubic-bezier(.16,1,.3,1)'
            el.style.opacity = ''
            el.style.transform = ''
          })
          continue
        }

        const dx = was.left - is.left
        const dy = was.top - is.top
        if (!dx && !dy) continue
        // transition:none before the invert, or the snap-back animates too.
        el.style.transition = 'none'
        el.style.transform = `translate(${dx}px, ${dy}px)`
        // The rAF is mandatory — set and clear in the same frame and the
        // browser coalesces them into nothing.
        requestAnimationFrame(() => {
          el.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)'
          el.style.transform = ''
        })
      }
    })
  }

  return (
    <div>
      <ul className="mt-8 flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            onClick={() => pick(null)}
            aria-pressed={useCase === null}
            className={cn(
              'rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors',
              useCase === null
                ? 'border-transparent bg-brand-500 text-white'
                : 'border-surface-line bg-white text-slate-body hover:border-brand-400 hover:text-brand-600'
            )}
          >
            {t('allProducts')}
          </button>
        </li>
        {USE_CASES.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => pick(u.id)}
              aria-pressed={useCase === u.id}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors',
                useCase === u.id
                  ? 'border-transparent bg-brand-500 text-white'
                  : 'border-surface-line bg-white text-slate-body hover:border-brand-400 hover:text-brand-600'
              )}
            >
              {tu(u.id)}
            </button>
          </li>
        ))}
      </ul>

      <ul ref={listRef} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => (
          <li key={p.slug} data-slug={p.slug}>
            <ProductCard product={p} base={base} viewLabel={tc('viewDetails')} />
          </li>
        ))}
      </ul>
    </div>
  )
}
