'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, ArrowRight, Tag } from 'lucide-react'
import { PRODUCTS, CATEGORIES, categoryLabel } from '@/lib/products'
import { cn } from '@/lib/cn'

const MAX_CATEGORIES = 3
const MAX_PRODUCTS = 8

/** Model codes are written a dozen ways — "NGP-MC720-S", "ngp mc720 s", "ngpmc720". */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Pre-squashed haystack, built once at module scope — the catalog is static, so
 * there is no reason to redo this on every keystroke.
 */
const INDEX = PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  image: p.images[0],
  lower: p.name.toLowerCase(),
  squashed: squash(p.name),
}))

const CATEGORY_INDEX = CATEGORIES.map((c) => ({
  name: c.name,
  count: c.count,
  lower: c.name.toLowerCase(),
  squashed: squash(c.name),
}))

/**
 * What to show before anyone has typed: the hardware most widely deployed in
 * retail worldwide, drawn only from our own catalog.
 *
 * This order is EDITORIAL, not measured — we have no sales or install data, so
 * nothing here can be derived. It reflects which POS categories are near
 * universal in shops globally (every till has a scanner and a receipt printer;
 * far fewer have a vending robot). Reorder this list to change what surfaces.
 */
const POPULAR_CATEGORIES = [
  'barcode scanner',
  'thermal receipt printer',
  'pos machines',
  'cash drawer',
  'barcode label printer',
  'electronic weightscale',
  'customer display',
]

/**
 * First not-yet-taken product per popular category. The dedupe matters: one
 * product can sit in two of these categories (the M80 label printer does),
 * and without it the list repeats a row and React sees duplicate keys.
 */
const POPULAR = (() => {
  const taken = new Set<string>()
  const out: { slug: string; name: string; image?: string }[] = []
  for (const needle of POPULAR_CATEGORIES) {
    const p = PRODUCTS.find(
      (x) => !taken.has(x.slug) && x.categories.some((c) => c.toLowerCase().includes(needle))
    )
    if (p) {
      taken.add(p.slug)
      out.push({ slug: p.slug, name: p.name, image: p.images[0] })
    }
  }
  return out
})()

/** Prefix matches outrank mid-string ones, so "bar" leads with "Barcode …". */
function rank(lower: string, squashed: string, needle: string, needleSquashed: string) {
  if (lower.startsWith(needle)) return 0
  if (needleSquashed && squashed.startsWith(needleSquashed)) return 1
  if (lower.includes(needle)) return 2
  if (needleSquashed && squashed.includes(needleSquashed)) return 3
  return -1
}

type Row =
  | { kind: 'category'; name: string; count: number }
  | { kind: 'product'; slug: string; name: string; image?: string }
  | { kind: 'all'; total: number }

/**
 * Header search. Results appear as you type; Enter opens the highlighted row,
 * or falls through to the full results page on /shop.
 */
export function SearchMenu({ base }: { base: string }) {
  const t = useTranslations('shop')
  const tNav = useTranslations('nav')
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(-1)

  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Same 80ms-in hover intent as the mega-menu. Deliberately does NOT focus
   * the input: closeOnHover keeps a focused panel open, so hover-focus made a
   * drive-by hover pin the panel permanently (and two dropdowns could stack).
   * Click-open still focuses, for people who came to type.
   */
  function openOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpen(true), 80)
  }

  /**
   * Unlike the other header menus this one holds a text field, so leaving with
   * the pointer must not yank it shut mid-typing. Only close an untouched,
   * unfocused panel — Escape and outside-click still close it unconditionally.
   */
  function closeOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      const busy = query.trim() || document.activeElement === inputRef.current
      if (!busy) setOpen(false)
    }, 180)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const { rows, totalProducts } = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return { rows: [] as Row[], totalProducts: 0 }
    const needleSquashed = squash(query)

    const cats = CATEGORY_INDEX.map((c) => ({ c, r: rank(c.lower, c.squashed, needle, needleSquashed) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || b.c.count - a.c.count)
      .slice(0, MAX_CATEGORIES)

    const prods = INDEX.map((p) => ({ p, r: rank(p.lower, p.squashed, needle, needleSquashed) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.p.name.localeCompare(b.p.name))

    const out: Row[] = [
      ...cats.map(({ c }) => ({ kind: 'category' as const, name: c.name, count: c.count })),
      ...prods.slice(0, MAX_PRODUCTS).map(({ p }) => ({
        kind: 'product' as const,
        slug: p.slug,
        name: p.name,
        image: p.image,
      })),
    ]
    // Always offered, not just past MAX_PRODUCTS — it is the route to the full
    // grid with filters, which is useful even when everything already fits.
    if (prods.length) out.push({ kind: 'all', total: prods.length })
    return { rows: out, totalProducts: prods.length }
  }, [query])

  const shopWithQuery = `${base}/shop?q=${encodeURIComponent(query.trim())}`

  function go(href: string) {
    inputRef.current?.blur()
    setOpen(false)
    setQuery('')
    setHighlight(-1)
    router.push(href)
  }

  function hrefFor(row: Row) {
    if (row.kind === 'category') return `${base}/shop?category=${encodeURIComponent(row.name)}`
    if (row.kind === 'product') return `${base}/shop/${row.slug}`
    return shopWithQuery
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h + 1) % rows.length : -1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h <= 0 ? rows.length - 1 : h - 1) : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[highlight]
      if (row) go(hrefFor(row))
      else if (query.trim()) go(shopWithQuery)
    }
  }

  function onChange(value: string) {
    setQuery(value)
    setHighlight(-1)
  }

  return (
    <div
      ref={wrapRef}
      className="relative hidden sm:block"
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnHover}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          // Focus after paint — the input does not exist until `open` flips.
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        aria-expanded={open}
        aria-label={tNav('search')}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div
          className="glass-panel absolute end-0 top-[calc(100%+1.75rem)] z-50 w-[24rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl"
          style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
        >
          <div className="relative border-b border-surface-line">
            <Search
              className="pointer-events-none absolute inset-y-0 start-4 my-auto h-4 w-4 text-slate-faint"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('searchPlaceholder')}
              aria-label={tNav('search')}
              className="h-12 w-full bg-transparent ps-11 pe-11 text-sm outline-none placeholder:text-slate-faint"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label={tNav('close')}
                className="absolute inset-y-0 end-3 my-auto flex h-7 w-7 items-center justify-center rounded-full text-slate-faint transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          {query.trim() ? (
            rows.length ? (
              <ul className="max-h-[24rem] overflow-y-auto py-2">
                {rows.map((row, i) => {
                  const on = i === highlight
                  if (row.kind === 'category') {
                    return (
                      <li key={`c-${row.name}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlight(i)}
                          onClick={() => go(hrefFor(row))}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition-colors',
                            on ? 'bg-brand-50 text-brand-700' : 'hover:bg-brand-50/60'
                          )}
                        >
                          <Tag className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                          <span className="flex-1 font-medium">{categoryLabel(row.name, tCat)}</span>
                          <span className="text-xs text-slate-faint">{row.count}</span>
                        </button>
                      </li>
                    )
                  }
                  if (row.kind === 'product') {
                    return (
                      <li key={row.slug}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlight(i)}
                          onClick={() => go(hrefFor(row))}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2 text-start transition-colors',
                            on ? 'bg-brand-50' : 'hover:bg-brand-50/60'
                          )}
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card border border-surface-line bg-white">
                            {row.image ? (
                              <Image
                                src={row.image}
                                alt=""
                                fill
                                sizes="40px"
                                quality={70}
                                className="object-contain p-1"
                              />
                            ) : null}
                          </span>
                          <span className="line-clamp-2 flex-1 text-xs font-medium leading-snug text-ink">
                            {row.name}
                          </span>
                        </button>
                      </li>
                    )
                  }
                  return (
                    <li key="all">
                      <button
                        type="button"
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => go(hrefFor(row))}
                        className={cn(
                          'flex w-full items-center gap-2 border-t border-surface-line px-4 py-3 text-start text-sm font-medium transition-colors',
                          on ? 'bg-brand-50 text-brand-700' : 'text-brand-600 hover:bg-brand-50/60'
                        )}
                      >
                        {tc('seeAll')}
                        <span className="text-slate-faint">
                          {row.total === 1
                            ? t('resultsOne', { count: row.total })
                            : t('resultsOther', { count: row.total })}
                        </span>
                        <ArrowRight className="ms-auto h-4 w-4 rtl:rotate-180" aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-muted">{t('noResults')}</p>
            )
          ) : (
            <div className="py-2">
              <p className="px-4 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-faint">
                {t('popular')}
              </p>
              <ul>
                {POPULAR.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => go(`${base}/shop/${p.slug}`)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-start transition-colors hover:bg-brand-50/60"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card border border-surface-line bg-white">
                        {p.image ? (
                          <Image src={p.image} alt="" fill sizes="40px" quality={70} className="object-contain p-1" />
                        ) : null}
                      </span>
                      <span className="line-clamp-2 flex-1 text-xs font-medium leading-snug text-ink">
                        {p.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Same escape hatch as the searched state: straight to the full
                  grid, here with no query so it lands on all 75. */}
              <button
                type="button"
                onClick={() => go(`${base}/shop`)}
                className="mt-1 flex w-full items-center gap-2 border-t border-surface-line px-4 py-3 text-start text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50/60"
              >
                {t('allProducts')}
                <span className="text-slate-faint">
                  {t('resultsOther', { count: PRODUCTS.length })}
                </span>
                <ArrowRight className="ms-auto h-4 w-4 rtl:rotate-180" aria-hidden />
              </button>
            </div>
          )}

          {/* Keeps the count honest even when the "see all" row is not shown. */}
          <span className="sr-only" aria-live="polite">
            {totalProducts}
          </span>
        </div>
      ) : null}
    </div>
  )
}
