'use client'

import { useEffect, useRef } from 'react'
import { BrainCircuit, ScanBarcode, Boxes, Network } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

const ICONS = [BrainCircuit, ScanBarcode, Boxes, Network]

/**
 * "One connected platform" — the copy says every part talks to every other
 * part, so the animation shows it: a connector line draws behind the four
 * cards, then a data pulse travels along it on a loop. The line only shows in
 * the gaps because the cards are opaque and stacked above it.
 *
 * The pulse is transform-based (translateX to a JS-measured --travel), never
 * `left` — left triggers layout every frame. The observer that reveals the
 * section also toggles it off-screen so the infinite loop pauses.
 */
export function ConnectedPillars({
  items,
}: {
  /** Translated per-pillar copy, in display order. */
  items: { title: string; body: string }[]
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const connectorRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new IntersectionObserver(
      ([entry]) => stage.setAttribute('data-inview', String(entry.isIntersecting)),
      { threshold: 0.25 }
    )
    observer.observe(stage)

    // Travel distance = the connector's real width, sign-flipped under RTL so
    // the dot still runs start -> end. Re-measured on (debounced) resize.
    let timer: ReturnType<typeof setTimeout> | null = null
    const measure = () => {
      const line = connectorRef.current
      const pulse = pulseRef.current
      if (!line || !pulse) return
      const rtl = document.documentElement.dir === 'rtl'
      const width = Math.max(0, line.getBoundingClientRect().width - 9)
      pulse.style.setProperty('--travel', `${rtl ? -width : width}px`)
    }
    const onResize = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(measure, 150)
    }
    measure()
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <div ref={stageRef} className="pillars-stage mt-14" data-inview="false">
      <div ref={connectorRef} aria-hidden className="pillars-connector hidden lg:block" />
      <div ref={pulseRef} aria-hidden className="pillars-pulse hidden lg:block" />

      <ul className="pillars-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            // 180ms — slower than the stagger elsewhere, so it reads as a
            // signal propagating card to card rather than four cards appearing.
            <Reveal as="li" key={item.title} delay={i * 180}>
              <div className="pillar-card card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-muted">{item.body}</p>
              </div>
            </Reveal>
          )
        })}
      </ul>
    </div>
  )
}
