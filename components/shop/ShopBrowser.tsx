'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/shop/ProductCard'
import { USE_CASES, type ProductCardData, type UseCaseId } from '@/lib/products'
import { cn } from '@/lib/cn'

type CategoryOption = { name: string; count: number }

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
            {category ?? t('allProducts')}
          </span>
        </button>

        <div className={cn('space-y-8', !filtersOpen && 'hidden lg:block')}>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-faint">
              {t('categories')}
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-card px-3 py-2 text-start text-sm transition-colors',
                    !category
                      ? 'bg-brand-50 font-semibold text-brand-700'
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
                    onClick={() => setCategory(c.name)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-card px-3 py-2 text-start text-sm transition-colors',
                      category === c.name
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-slate-body hover:bg-surface-alt'
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-faint">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
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
            <p className="text-sm text-slate-muted">
              {results.length === 1
                ? t('resultsOne', { count: results.length })
                : t('resultsOther', { count: results.length })}
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

        {results.length ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} base={base} viewLabel={tc('viewDetails')} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-panel border border-dashed border-surface-line bg-white p-12 text-center">
            <p className="text-slate-muted">{t('noResults')}</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-sm font-medium text-brand-600 transition-colors hover:text-brand-800"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
