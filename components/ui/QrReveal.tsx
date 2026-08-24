'use client'

import { useEffect, useRef, useState } from 'react'
import { QrCode } from 'lucide-react'
import { AddressQr } from '@/components/ui/AddressQr'
import { cn } from '@/lib/cn'

/**
 * A "Scan for directions" chip that reveals an office QR on demand — the
 * footer shows this on every page instead of six permanent QR codes; only the
 * contact page keeps its always-visible ones.
 *
 * Hover reveals on mouse devices (same 80/180ms intent as the header menus),
 * tap toggles for touch, Escape and outside-click dismiss.
 */
export function QrReveal({
  url,
  title,
  label,
}: {
  url: string
  title: string
  /** Chip text — pass the localized contact.scanForAddress string. */
  label: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        className={cn(
          'flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors',
          open
            ? 'border-transparent bg-brand-500 text-white'
            : 'border-surface-line bg-white text-slate-body hover:border-brand-400 hover:text-brand-600'
        )}
      >
        <QrCode className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>

      {open ? (
        <div
          // Above the chip, not below — the footer sits at the page's end, so
          // a downward popover would clip against the viewport bottom.
          className="absolute bottom-[calc(100%+0.5rem)] start-0 z-40 rounded-panel bg-white p-1 shadow-xl ring-1 ring-black/5"
          style={{ animation: 'word-rise .22s var(--ease-out-soft) both' }}
        >
          <AddressQr url={url} title={title} size={112} />
        </div>
      ) : null}
    </div>
  )
}
