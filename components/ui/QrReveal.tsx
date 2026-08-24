'use client'

import { useEffect, useRef, useState } from 'react'
import { QrCode, MapPin } from 'lucide-react'
import { AddressQr } from '@/components/ui/AddressQr'
import { cn } from '@/lib/cn'

/**
 * A "Scan for directions" chip that reveals an office QR on demand — the
 * footer shows this on every page instead of six permanent QR codes; only the
 * contact page keeps its always-visible ones.
 *
 * Hover reveals on mouse devices (same 80/180ms intent as the header menus),
 * Escape and outside-click dismiss. The popover stays mounted and toggles
 * `data-open`, so the unfold animation (globals.css .qr-pop) plays in both
 * directions.
 *
 * On touch devices the chip is a plain maps link instead: a QR code is for
 * scanning with a phone, which is useless on the device already in hand —
 * and :hover doesn't exist there anyway.
 */
export function QrReveal({
  url,
  title,
  label,
  mapsLabel,
}: {
  url: string
  title: string
  /** Chip text — pass the localized contact.scanForAddress string. */
  label: string
  /** Touch-device chip text — pass the localized contact.openInMaps string. */
  mapsLabel: string
}) {
  const [open, setOpen] = useState(false)
  // false during SSR and on desktop; flipped once on touch-only devices.
  const [touchOnly, setTouchOnly] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTouchOnly(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  function openOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpen(true), 80)
  }
  function closeOnHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpen(false), 180)
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

  const chipClasses = cn(
    'flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors',
    open
      ? 'border-transparent bg-brand-500 text-white'
      : 'border-surface-line bg-white text-slate-body hover:border-brand-400 hover:text-brand-600'
  )

  if (touchOnly) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={cn(chipClasses, 'mt-3 inline-flex')}
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {mapsLabel}
      </a>
    )
  }

  return (
    <div
      ref={wrapRef}
      className="relative mt-3 inline-block"
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnHover}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={chipClasses}
      >
        <QrCode className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>

      <div
        // Above the chip, not below — the footer sits at the page's end, so
        // a downward popover would clip against the viewport bottom.
        className="qr-pop absolute bottom-[calc(100%+0.7rem)] start-0 z-40 rounded-panel border border-surface-line bg-white p-1 shadow-[0_16px_34px_rgba(15,30,46,0.18)]"
        data-open={open}
        aria-hidden={!open}
      >
        <AddressQr url={url} title={title} size={112} />
      </div>
    </div>
  )
}
