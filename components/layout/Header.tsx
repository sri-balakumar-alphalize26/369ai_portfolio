'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  MonitorCog,
  Cpu,
  Smartphone,
  Info,
  CalendarDays,
} from 'lucide-react'
import { LocaleSwitcher } from './LocaleSwitcher'
import { PhoneMenu } from './PhoneMenu'
import { SearchMenu } from './SearchMenu'
import { CONTACT } from '@/content/offices'
import { CATEGORIES, categoryLabel } from '@/lib/products'
import { cn } from '@/lib/cn'

const NAV_ITEM =
  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors'
const NAV_ON = 'bg-brand-50 text-brand-700'
const NAV_OFF = 'text-ink hover:bg-brand-50/70 hover:text-brand-700'

/**
 * Floating capsule header — the hcltech.com pattern: one rounded bar inset from
 * the viewport edges, hovering over the hero rather than sitting above it.
 * Logo, nav and the language picker all live inside that single bar.
 */
export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()

  const [openMenu, setOpenMenu] = useState<'mega' | 'products' | 'company' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const base = `/${locale}`

  // Close any open menu when navigation changes the path — done as a
  // render-phase adjustment (the React-endorsed "reset state on prop change"
  // pattern), not an effect, so there is no cascaded second render.
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpenMenu(null)
    setMobileOpen(false)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    function onPointerDown(e: MouseEvent) {
      if (openMenu && !megaRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [openMenu])

  /** Hides on scroll-down, returns on scroll-up. rAF-throttled, transform-driven. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let lastY = window.scrollY
    let frame = 0

    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 8)
        // Never hide while a menu is open — it would yank it off screen.
        if (openMenu || mobileOpen || y < 8) setHidden(false)
        else if (y > lastY && y > 140) setHidden(true)
        else if (y < lastY) setHidden(false)
        lastY = y
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [openMenu, mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Hover intent — short delay in, longer out so the pointer can reach the panel.
  function openOnHover(menu: 'mega' | 'products' | 'company') {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpenMenu(menu), 80)
  }
  function closeOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 180)
  }

  // Mirrors the old Odoo menu: Product is a parent holding Software + Hardware.
  // About Us moved into the Company group (with Events) — see MobilePanel.
  const links = [
    { href: `${base}/solutions`, label: t('solutions') },
    { href: `${base}/services`, label: t('services') },
  ]

  return (
    <header
      className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5"
      data-hidden={hidden}
    >
      <div
        className={cn(
          'capsule-bar pointer-events-auto mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-2xl px-3 sm:h-[4.5rem] sm:gap-5 sm:px-5',
          'ring-1 ring-brand-900/10'
        )}
        data-scrolled={scrolled}
      >
        <Link href={base} className="flex shrink-0 items-center" aria-label={t('homeAria')}>
          <Image
            src="/images/brand/logo-369ai.png"
            alt="369ai.Biz"
            width={353}
            height={334}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          ref={megaRef}
          className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label={t('mainNav')}
        >
          {/* What We Do — full mega panel */}
          <div
            className="relative"
            onMouseEnter={() => openOnHover('mega')}
            onMouseLeave={closeOnHover}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'mega' ? null : 'mega')}
              aria-expanded={openMenu === 'mega'}
              className={cn(NAV_ITEM, openMenu === 'mega' ? NAV_ON : NAV_OFF)}
            >
              {t('whatWeDo')}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  openMenu === 'mega' && 'rotate-180'
                )}
                aria-hidden
              />
            </button>

            {openMenu === 'mega' ? (
              <MegaMenu base={base} onNavigate={() => setOpenMenu(null)} />
            ) : null}
          </div>

          <Link
            href={`${base}/solutions`}
            className={cn(NAV_ITEM, pathname === `${base}/solutions` ? NAV_ON : NAV_OFF)}
          >
            {t('solutions')}
          </Link>
          <Link
            href={`${base}/services`}
            className={cn(NAV_ITEM, pathname === `${base}/services` ? NAV_ON : NAV_OFF)}
          >
            {t('services')}
          </Link>

          {/* Products — parent holding Software + Hardware, mirroring the old
              Odoo menu where "Product" was a dropdown, not a page. */}
          <div
            className="relative"
            onMouseEnter={() => openOnHover('products')}
            onMouseLeave={closeOnHover}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'products' ? null : 'products')}
              aria-expanded={openMenu === 'products'}
              className={cn(
                NAV_ITEM,
                openMenu === 'products' ||
                  pathname === `${base}/products` ||
                  pathname === `${base}/apps` ||
                  pathname.startsWith(`${base}/shop`)
                  ? NAV_ON
                  : NAV_OFF
              )}
            >
              {t('products')}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  openMenu === 'products' && 'rotate-180'
                )}
                aria-hidden
              />
            </button>

            {openMenu === 'products' ? (
              <ProductsMenu base={base} onNavigate={() => setOpenMenu(null)} />
            ) : null}
          </div>

          {/* Company — About Us + Events, same small dropdown as Products. */}
          <div
            className="relative"
            onMouseEnter={() => openOnHover('company')}
            onMouseLeave={closeOnHover}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'company' ? null : 'company')}
              aria-expanded={openMenu === 'company'}
              className={cn(
                NAV_ITEM,
                openMenu === 'company' ||
                  pathname === `${base}/about` ||
                  pathname === `${base}/events`
                  ? NAV_ON
                  : NAV_OFF
              )}
            >
              {t('company')}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  openMenu === 'company' && 'rotate-180'
                )}
                aria-hidden
              />
            </button>

            {openMenu === 'company' ? (
              <CompanyMenu base={base} onNavigate={() => setOpenMenu(null)} />
            ) : null}
          </div>
        </nav>

        {/* Right cluster: phone · search · language · contact. Entering it
            closes any open mega-menu, so panels never stack. */}
        <div
          className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ms-0"
          onMouseEnter={() => setOpenMenu(null)}
        >
          <PhoneMenu />
          <SearchMenu base={base} />

          <LocaleSwitcher compact />

          <Link
            href={`${base}/contact`}
            className="shimmer relative hidden overflow-hidden rounded-xl bg-gradient-to-r from-accent-500 to-accent-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            {t('contact')}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label={t('menu')}
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <MobilePanel base={base} links={links} onClose={() => setMobileOpen(false)} />
      ) : null}
    </header>
  )
}

/** A separate floating glass card below the bar — not attached, not full-bleed. */
function MegaMenu({ base, onNavigate }: { base: string; onNavigate: () => void }) {
  const t = useTranslations('nav')
  const tSol = useTranslations('solutions')
  const tSrv = useTranslations('services')
  const tCat = useTranslations('categories')

  const columns = [
    {
      title: t('solutions'),
      href: `${base}/solutions`,
      items: [
        { label: tSol('erp.title'), href: `${base}/solutions#erp` },
        { label: tSol('pos.title'), href: `${base}/solutions#pos` },
        { label: tSol('robotics.title'), href: `${base}/solutions#robotics` },
        { label: tSol('locks.title'), href: `${base}/solutions#locks` },
        { label: tSol('vending.title'), href: `${base}/solutions#vending` },
      ],
    },
    {
      title: t('services'),
      href: `${base}/services`,
      items: [
        { label: tSrv('pos.title'), href: `${base}/services#pos` },
        { label: tSrv('erp.title'), href: `${base}/services#erp` },
        { label: tSrv('ai.title'), href: `${base}/services#ai` },
        { label: tSrv('cloud.title'), href: `${base}/services#cloud` },
        { label: tSrv('support.title'), href: `${base}/services#support` },
      ],
    },
    {
      title: t('shop'),
      href: `${base}/shop`,
      items: CATEGORIES.slice(0, 5).map((c) => ({
        label: categoryLabel(c.name, tCat),
        href: `${base}/shop?category=${encodeURIComponent(c.name)}`,
      })),
    },
  ]

  return (
    <div
      className={cn(
        'glass-panel absolute start-0 z-50 w-[58rem] max-w-[calc(100vw-3rem)] rounded-2xl p-7',
        // top-full is the BOTTOM OF THE TRIGGER, which sits ~1rem above the
        // capsule's own bottom edge. Clear that first, then add the gap, so the
        // panel never touches the bar.
        'top-[calc(100%+1.75rem)]'
      )}
      style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
    >
      <div className="glass-stagger grid gap-7 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <Link
              href={col.href}
              onClick={onNavigate}
              className="mb-3.5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-700 transition-colors hover:text-brand-900"
            >
              {col.title}
              <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
            </Link>
            <ul className="space-y-2">
              {col.items.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="-mx-2 block rounded-lg px-2 py-1.5 text-sm leading-snug text-slate-body transition-colors hover:bg-white/70 hover:text-brand-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 p-5">
          <p className="text-sm font-bold text-white">{t('featuredTitle')}</p>
          <p className="mt-2 text-xs leading-relaxed text-brand-100">{t('featuredBody')}</p>
          <Link
            href={`${base}/solutions`}
            onClick={onNavigate}
            className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline-offset-4 hover:underline"
          >
            {t('featuredCta')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Products → Software | Hardware, matching the old Odoo "Product" menu. */
function ProductsMenu({ base, onNavigate }: { base: string; onNavigate: () => void }) {
  const t = useTranslations('nav')

  const items = [
    {
      href: `${base}/products`,
      label: t('software'),
      blurb: t('softwareBlurb'),
      Icon: MonitorCog,
    },
    {
      href: `${base}/shop`,
      label: t('hardware'),
      blurb: t('hardwareBlurb'),
      Icon: Cpu,
    },
    {
      href: `${base}/apps`,
      label: t('apps'),
      blurb: t('appsBlurb'),
      Icon: Smartphone,
    },
  ]

  return (
    <div
      className="glass-panel absolute start-1/2 top-[calc(100%+1.75rem)] z-50 w-[26rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-2xl p-3 rtl:translate-x-1/2"
      style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
    >
      <ul className="space-y-1">
        {items.map(({ href, label, blurb, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className="flex gap-3.5 rounded-xl p-3.5 transition-colors hover:bg-white/75"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-muted">
                  {blurb}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Company → About Us | Events — the same card treatment as ProductsMenu. */
function CompanyMenu({ base, onNavigate }: { base: string; onNavigate: () => void }) {
  const t = useTranslations('nav')

  const items = [
    {
      href: `${base}/about`,
      label: t('about'),
      blurb: t('aboutBlurb'),
      Icon: Info,
    },
    {
      href: `${base}/events`,
      label: t('events'),
      blurb: t('eventsBlurb'),
      Icon: CalendarDays,
    },
  ]

  return (
    <div
      className="glass-panel absolute start-1/2 top-[calc(100%+1.75rem)] z-50 w-[26rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-2xl p-3 rtl:translate-x-1/2"
      style={{ animation: 'glass-in .36s var(--ease-out-soft) both' }}
    >
      <ul className="space-y-1">
        {items.map(({ href, label, blurb, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className="flex gap-3.5 rounded-xl p-3.5 transition-colors hover:bg-white/75"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-muted">
                  {blurb}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MobilePanel({
  base,
  links,
  onClose,
}: {
  base: string
  links: { href: string; label: string }[]
  onClose: () => void
}) {
  const t = useTranslations('nav')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // rAF rather than a bare set: the gate exists only to skip SSR (no
    // document to portal into), and this way the effect body stays async.
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
  if (!mounted) return null

  /**
   * Portalled to <body> deliberately. The header is transformed (it slides away
   * on scroll), and a transformed ancestor becomes the containing block for
   * position:fixed children — which pinned this panel inside the header's box
   * instead of the viewport.
   */
  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-surface-line px-5">
          <Image
            src="/images/brand/logo-369ai.png"
            alt="369ai.Biz"
            width={353}
            height={334}
            className="h-10 w-auto"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-muted hover:bg-brand-50 hover:text-ink"
            aria-label={t('close')}
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label={t('mobileNav')}>
          <ul className="space-y-1">
            {[{ href: base, label: t('home') }, ...links].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}

            {/* Products group — Software + Hardware, as in the Odoo menu. */}
            <li className="pt-3">
              <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-faint">
                {t('products')}
              </p>
              <Link
                href={`${base}/products`}
                onClick={onClose}
                className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t('software')}
              </Link>
              <Link
                href={`${base}/shop`}
                onClick={onClose}
                className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t('hardware')}
              </Link>
              <Link
                href={`${base}/apps`}
                onClick={onClose}
                className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t('apps')}
              </Link>
            </li>

            {/* Company group — About Us + Events. */}
            <li className="pt-3">
              <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-faint">
                {t('company')}
              </p>
              <Link
                href={`${base}/about`}
                onClick={onClose}
                className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t('about')}
              </Link>
              <Link
                href={`${base}/events`}
                onClick={onClose}
                className="block rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t('events')}
              </Link>
            </li>
          </ul>

          <Link
            href={`${base}/contact`}
            onClick={onClose}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-3 text-sm font-semibold text-white"
          >
            {t('contact')}
          </Link>

          <div className="mt-6 space-y-3 border-t border-surface-line pt-6 text-sm">
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center gap-2.5 text-slate-muted hover:text-brand-600"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {CONTACT.phoneDisplay}
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center gap-2.5 text-slate-muted hover:text-brand-600"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {CONTACT.email}
            </a>
          </div>
        </nav>
      </div>
    </div>,
    document.body
  )
}
