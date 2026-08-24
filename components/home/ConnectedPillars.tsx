'use client'

import { BrainCircuit, ScanBarcode, Boxes, Network } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { ConnectedStage } from '@/components/ui/ConnectedStage'

const ICONS = [BrainCircuit, ScanBarcode, Boxes, Network]

/**
 * "One connected platform" — the copy says every part talks to every other
 * part, so the animation shows it: a connector line draws behind the four
 * cards, then a data pulse travels along it on a loop. The stage mechanics
 * live in ConnectedStage, shared with the services preview on the homepage.
 */
export function ConnectedPillars({
  items,
}: {
  /** Translated per-pillar copy, in display order. */
  items: { title: string; body: string }[]
}) {
  return (
    <ConnectedStage className="mt-14">
      <ul className="connected-grid pillars-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
    </ConnectedStage>
  )
}
