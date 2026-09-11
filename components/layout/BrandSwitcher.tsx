'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Alphalize / 369AI switcher, hung off the header logo — the Flipkart pattern.
 *
 * The logo arrives through `children` rather than being rendered here, so this
 * component's root is at once the hover target and the positioning context.
 * A sibling arrangement would leave the logo outside that root, and hovering
 * the logo is the whole feature.
 *
 * Open state lives in Header, not here: the header already owns a single
 * `openMenu` union that drives Escape, outside-click, the route-change reset
 * and — the one that matters — the scroll-hide guard, so the bar cannot
 * retract out from under an open panel. A second, local state would have to
 * re-implement all four.
 *
 * Not a listbox and not a menu, so no aria-haspopup: two links that navigate,
 * behind a plain disclosure button.
 */
export function BrandSwitcher({
  ref,
  base,
  open,
  onToggle,
  onOpenHover,
  onCloseHover,
  children,
}: {
  /** Header's outside-click handler needs the root — React 19 takes ref as a prop. */
  ref?: React.Ref<HTMLDivElement>
  /** `/${locale}` — the 369AI row points home within the current locale. */
  base: string
  open: boolean
  onToggle: () => void
  onOpenHover: () => void
  onCloseHover: () => void
  /** The logo link, passed in so it sits inside the hover target. */
  children: React.ReactNode
}) {
  const t = useTranslations('brand')

  return (
    <div
      ref={ref}
      className="relative flex shrink-0 items-center gap-0.5"
      onMouseEnter={onOpenHover}
      onMouseLeave={onCloseHover}
    >
      {children}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="brand-panel"
        aria-label={t('switchLabel')}
        /* Deliberately the same object as the Company and Products headings in
           the nav — same ink, same 3.5 glyph, same lucide stroke, same hover
           tint — so the bar reads as one row of controls rather than a logo
           with an ornament stuck to it. */
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
          open ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-brand-50/70 hover:text-brand-700'
        )}
      >
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {/* Kept in the DOM and toggled, not mounted on open: the two tiles are
          next/image, and a panel that only exists once opened starts fetching
          them at that moment, so the rows arrived blank and filled in a beat
          later. Always mounted plus loading="eager" means they are cached long
          before anyone opens it. `inert` is what keeps a closed panel out of
          the tab order and the accessibility tree. */}
      <ul
        id="brand-panel"
        aria-label={t('switchLabel')}
        inert={!open}
        /* Anchored to the START edge, unlike the locale panel's end-0 — the
           logo sits at the start of the bar. The width clamps because the bar
           is logo + burger at 320px, where a fixed 19rem would overflow the
           page gutters. */
        className={cn(
          'glass-panel absolute start-0 top-[calc(100%+1.75rem)] z-50 w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl p-1.5',
          /* translate and scale, not transform: Tailwind v4 emits the
             individual CSS properties, so a transform transition would animate
             nothing here. visibility is in the list on purpose — it is what
             takes the closed panel out of hit-testing, and the spec holds it
             visible for the whole outgoing run so the close still plays. */
          'transition-[opacity,translate,scale,visibility] duration-300 ease-[var(--ease-out-soft)]',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-2 scale-[0.98] opacity-0'
        )}
      >
        <li>
          <Link
            href={base}
            aria-current="true"
            className="flex items-center gap-3 rounded-xl bg-brand-50/80 px-2.5 py-2.5 transition-colors"
          >
            <BrandTile src="/images/brand/logo-369ai.png" />
            <BrandText name="369AI" tagline={t('ai369Tagline')} />
            <Check className="ms-auto h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
          </Link>
        </li>
        <li>
          <a
            href="https://www.alphalize.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-brand-50"
          >
            <BrandTile src="/images/partners/alphalize.png" />
            <BrandText name="Alphalize" tagline={t('alphalizeTagline')} />
            <span className="sr-only">({t('newTab')})</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

/** The logo sits on a tinted square that clears to white as the row lights up. */
function BrandTile({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="grid h-[2.125rem] w-[2.125rem] shrink-0 place-items-center rounded-xl bg-brand-50 p-1 transition-colors group-hover:bg-white"
    >
      {/* eager, not lazy: the panel is transparent until opened, and a lazy
          image inside it would not begin loading until the moment it is
          wanted — which is the beat of blankness this replaces. */}
      <Image
        src={src}
        alt=""
        width={80}
        height={80}
        loading="eager"
        className="h-full w-full object-contain"
      />
    </span>
  )
}

/** The tagline is subordinate to the name above it, so it steps down a size. */
function BrandText({ name, tagline }: { name: string; tagline: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-px">
      <b className="text-[0.8125rem] font-semibold leading-tight text-ink">{name}</b>
      <span className="text-[0.6875rem] leading-snug text-slate-muted">{tagline}</span>
    </span>
  )
}
