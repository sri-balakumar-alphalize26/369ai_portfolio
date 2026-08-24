'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/shop/ProductCard'
import { USE_CASES, categoryLabel, type ProductCardData, type UseCaseId } from '@/lib/products'
import { cn } from '@/lib/cn'

type CategoryOption = { name: string; count: number }

/**
 * Tweens the results count toward its target — "75 products" counting down
 * to "7 products" confirms the filter worked; a snapped number is easy to
 * miss. Skipped under reduced motion.
 */
function useTweenedCount(target: number) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)
  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = target
      setDisplay(target)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 400)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      fromRef.current = target
    }
  }, [target])
  return display
}

/**
 * The hardware catalog browser: free-text search, category list and use-case
 * pills over the full 75-SKU range.
 *
 * The selected category lives in the URL (?category=…) rather than in state,
 * because the header's mega-menu links straight to /shop?category=<name> —
 * reading it from the URL means those links land on a filtered grid, and a
 * filtered view stays shareable. Search text and use case are transient, so
 * they stay in local state.
 */
export function ShopBrowser({
  products,
  categories,
  base,
}: {
  products: ProductCardData[]
  categories: CategoryOption[]
  base: string
}) {
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const tu = useTranslations('useCases')
  const tCat = useTranslations('categories')

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const category = searchParams.get('category')
  const query = searchParams.get('q') ?? ''
  const [useCase, setUseCase] = useState<UseCaseId | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function setCategory(next: string | null) {
    replaceParams((p) => (next ? p.set('category', next) : p.delete('category')))
  }

  /**
   * The typed value is echoed by the input itself (uncontrolled, keyed on `q`),
   * so the URL only has to catch up — debounced, or every keystroke would cost
   * a router.replace.
   */
  function setQuery(next: string) {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      replaceParams((p) => (next.trim() ? p.set('q', next) : p.delete('q')))
    }, 250)
  }

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [])

  function clearAll() {
    if (debounce.current) clearTimeout(debounce.current)
    setUseCase(null)
    replaceParams((p) => {
      p.delete('category')
      p.delete('q')
    })
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category && !p.categories.includes(category)) return false
      if (useCase && !p.useCases.includes(useCase)) return false
      if (needle && !p.name.toLowerCase().includes(needle)) return false
      return true
    })
  }, [products, category, useCase, query])

  const filtered = Boolean(category || useCase || query.trim())
  const shownCount = useTweenedCount(results.length)
  const visibleSlugs = useMemo(() => new Set(results.map((r) => r.slug)), [results])

  // Sliding category marker: one bar that GLIDES between sidebar items
  // instead of a highlight blinking on and off — on a long category list
  // it shows where you came from as well as where you are. transform, not
  // top: compositor-only, and it tweens between items of different heights.
  const catWrapRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const wrap = catWrapRef.current
    const mark = markRef.current
    if (!wrap || !mark) return
    const move = () => {
      const active = wrap.querySelector<HTMLElement>(
        `[data-cat="${CSS.escape(category ?? 'all')}"]`
      )
      if (!active || !active.offsetParent) {
        mark.style.opacity = '0'
        return
      }
      const wb = wrap.getBoundingClientRect()
      const b = active.getBoundingClientRect()
      mark.style.opacity = '1'
      mark.style.height = `${b.height - 4}px`
      mark.style.transform = `translateY(${b.top - wb.top + 2}px)`
    }
    move()
    document.fonts?.ready.then(move).catch(() => {})
    window.addEventListener('resize', move)
    return () => window.removeEventListener('resize', move)
  }, [category, filtersOpen])

  // FLIP reflow: on every filter/search change, surviving cards glide from
  // their previous grid position to the new one instead of snapping — with
  // 75 products it is the difference between "something changed" and "I can
  // see what changed". Rects are captured after every commit, so the
  // previous commit's layout is the FLIP "first" state.
  const gridRef = useRef<HTMLUListElement>(null)
  const flipRects = useRef(new Map<string, DOMRect>())
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const prev = flipRects.current
    const next = new Map<string, DOMRect>()
    const items = Array.from(grid.querySelectorAll<HTMLElement>('li[data-slug]'))
    for (const el of items) {
      if (!el.classList.contains('hidden')) {
        next.set(el.dataset.slug as string, el.getBoundingClientRect())
      }
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of items) {
        const b = next.get(el.dataset.slug as string)
        if (!b) continue // still hidden — nothing to do
        const a = prev.get(el.dataset.slug as string)
        if (!a) {
          // Was hidden, now shown. A FLIP from its zero-rect would fly it
          // in from a meaningless position — fade+scale in place instead.
          el.classList.add('flip-enter')
          requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.remove('flip-enter'))
          })
          continue
        }
        const dx = a.left - b.left
        const dy = a.top - b.top
        if (!dx && !dy) continue
        // Freeze at the old position, then clear BOTH inline values so the
        // stylesheet transition (on li[data-slug]) animates it home — no
        // inline transition left behind to fight later opacity fades.
        el.style.transition = 'none'
        el.style.transform = `translate(${dx}px, ${dy}px)`
        requestAnimationFrame(() => {
          el.style.transition = ''
          el.style.transform = ''
        })
      }
    }
    flipRects.current = next
  })

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
      {/* Sidebar — a disclosure on mobile, always open from lg up */}
      <div>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="mb-4 flex w-full items-center justify-between gap-2 rounded-card border border-surface-line bg-white px-4 py-3 text-sm font-semibold lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-500" aria-hidden />
            {t('categories')}
          </span>
          <span className="text-xs font-normal text-slate-faint">
            {category ? categoryLabel(category, tCat) : t('allProducts')}
          </span>
        </button>

        <div className={cn('space-y-8', !filtersOpen && 'hidden lg:block')}>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-faint">
              {t('categories')}
            </p>
            {/* The active highlight is the single .cat-mark bar behind the
                list, positioned by the effect above — buttons only change
                text weight/colour so the bar can glide between them. */}
            <div ref={catWrapRef} className="relative">
              <span ref={markRef} aria-hidden className="cat-mark" />
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    data-cat="all"
                    onClick={() => setCategory(null)}
                    className={cn(
                      'relative flex w-full items-center justify-between gap-2 rounded-card px-3 py-2 text-start text-sm transition-colors',
                      !category
                        ? 'font-semibold text-brand-700'
                        : 'text-slate-body hover:bg-surface-alt'
                    )}
                  >
                    {t('allProducts')}
                    <span className="text-xs text-slate-faint">{products.length}</span>
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      data-cat={c.name}
                      onClick={() => setCategory(c.name)}
                      className={cn(
                        'relative flex w-full items-center justify-between gap-2 rounded-card px-3 py-2 text-start text-sm transition-colors',
                        category === c.name
                          ? 'font-semibold text-brand-700'
                          : 'text-slate-body hover:bg-surface-alt'
                      )}
                    >
                      <span>{categoryLabel(c.name, tCat)}</span>
                      <span className="text-xs text-slate-faint">{c.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-faint">
              {t('useCase')}
            </p>
            <ul className="flex flex-wrap gap-2">
              {USE_CASES.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setUseCase(useCase === u.id ? null : u.id)}
                    aria-pressed={useCase === u.id}
                    className={cn(
                      'rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors',
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
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-4 w-4 text-slate-faint"
              aria-hidden
            />
            <input
              type="search"
              key={query}
              defaultValue={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="h-11 w-full rounded-pill border border-surface-line bg-white ps-10 pe-4 text-sm outline-none transition-colors placeholder:text-slate-faint focus:border-brand-400"
            />
          </label>

          <div className="flex items-center gap-3">
            <p className="text-sm tabular-nums text-slate-muted">
              {shownCount === 1
                ? t('resultsOne', { count: shownCount })
                : t('resultsOther', { count: shownCount })}
            </p>
            {filtered ? (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 rounded-pill border border-surface-line bg-white px-3 py-1.5 text-xs font-medium text-slate-body transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                {t('clearFilters')}
              </button>
            ) : null}
          </div>
        </div>

        {/* All 75 cards stay mounted; filters toggle visibility so the FLIP
            effect can glide the survivors into their new positions. */}
        <ul
          ref={gridRef}
          className={cn(
            'shop-grid mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
            !results.length && 'hidden'
          )}
        >
          {products.map((p) => (
            <li key={p.slug} data-slug={p.slug} className={cn(!visibleSlugs.has(p.slug) && 'hidden')}>
              <ProductCard product={p} base={base} viewLabel={tc('viewDetails')} />
            </li>
          ))}
        </ul>
        {!results.length ? (
          <div
            className="mt-8 rounded-panel border border-dashed border-surface-line bg-white p-12 text-center"
            style={{ animation: 'word-rise .3s var(--ease-out-soft) both' }}
          >
            <p className="text-slate-muted">{t('noResults')}</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-sm font-medium text-brand-600 transition-colors hover:text-brand-800"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
