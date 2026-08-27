'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

const STATS = [
  { key: 'cities', value: 30, suffix: '+' },
  { key: 'clients', value: 896, suffix: '+' },
  { key: 'uptime', value: 99, suffix: '%' },
  { key: 'devices', value: 496, suffix: '+' },
] as const

/** SSR-safe reduced-motion check — used for lazy initial state. */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Stats band, styled after hcltech.com: a light field, big dark numerals, a
 * quiet label, and a hairline rule under each item.
 *
 * One observer on the whole band starts the show once at 40% visibility;
 * columns then land left to right 150ms apart. Within a column, ONE eased
 * progress value drives both the digits and the accent fill over the
 * hairline — the same animation rendered twice, so they cannot drift apart
 * (two separate animations at the same duration still desync: different
 * curves, different start frames). Only when that value settles do the
 * suffix pop and the label rise. Screen readers hear the final value once
 * via sr-only text, never the ticking number.
 */
export function StatsRow({ title }: { title: string }) {
  const t = useTranslations('stats')
  const ref = useRef<HTMLDListElement>(null)
  const [run, setRun] = useState(prefersReducedMotion)

  useEffect(() => {
    const el = ref.current
    if (!el || run) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRun(true)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [run])

  return (
    <section className="border-y border-surface-line bg-surface-alt py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="text-center text-lg font-medium text-slate-muted">{title}</h2>

        <dl ref={ref} className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.key}
              value={stat.value}
              suffix={stat.suffix}
              label={t(stat.key)}
              run={run}
              delay={i * 150}
            />
          ))}
        </dl>
      </div>
    </section>
  )
}

function StatItem({
  value,
  suffix,
  label,
  run,
  delay,
}: {
  value: number
  suffix: string
  label: string
  run: boolean
  delay: number
}) {
  const numRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  // Under reduced motion everything renders settled from the first frame.
  const [done, setDone] = useState(prefersReducedMotion)

  useEffect(() => {
    if (!run || done) return
    // (reduced motion never reaches here: initial state is already settled)

    let frame = 0
    const timer = setTimeout(() => {
      const duration = 1500
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const e = 1 - Math.pow(1 - p, 3) // easeOutCubic
        // Digits and fill are written from the SAME eased value in the same
        // frame — the one animation rendered twice, so they can't drift.
        // Direct DOM writes, not state: 90 renders/frame buys nothing here.
        if (numRef.current) numRef.current.textContent = String(Math.round(value * e))
        if (fillRef.current) fillRef.current.style.width = `${(e * 100).toFixed(1)}%`
        if (p < 1) frame = requestAnimationFrame(tick)
        else setDone(true)
      }
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- starts once per run flip
  }, [run])

  return (
    <div className={cn('group cursor-default', done && 'stat-done')}>
      <dd>
        {/* The ticking number is decoration to a screen reader — hide it and
            announce the settled value once instead. */}
        <span className="sr-only">
          {value}
          {suffix} {label}
        </span>
        <span
          aria-hidden
          className="block text-4xl font-bold tabular-nums text-ink transition-colors duration-300 group-hover:text-brand-600 sm:text-5xl lg:text-6xl"
        >
          <span ref={numRef}>{done ? value : 0}</span>
          <span className="stat-suffix">{suffix}</span>
        </span>
      </dd>
      <dt
        aria-hidden
        className="stat-label mt-2 text-sm leading-snug text-slate-muted transition-colors duration-300 group-hover:text-brand-600 sm:text-base"
      >
        {label}
      </dt>
      {/* The accent rides OVER the hairline track — slightly thicker (2px vs
          1px) so it reads as filling the rule, not recolouring it. Width is
          set by the same eased value as the digits. */}
      <span aria-hidden className="relative mt-4 block h-0.5 w-full">
        <span className="absolute inset-x-0 bottom-0 h-px bg-surface-line" />
        <span
          ref={fillRef}
          className="stat-fill absolute bottom-0 start-0 h-0.5 rounded-full bg-brand-500"
          style={{ width: done ? '100%' : '0%' }}
        />
      </span>
    </div>
  )
}
