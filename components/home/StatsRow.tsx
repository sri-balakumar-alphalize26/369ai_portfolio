'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const STATS = [
  { key: 'cities', value: 30, suffix: '+' },
  { key: 'clients', value: 896, suffix: '+' },
  { key: 'uptime', value: 99, suffix: '%' },
  { key: 'devices', value: 496, suffix: '+' },
] as const

/**
 * Stats band, styled after hcltech.com: a light field, big dark numerals, a
 * quiet label, and a hairline rule under each item. Hovering an item turns the
 * number, label and rule brand-blue — their highlight treatment, but driven by
 * the pointer rather than hard-coded onto one item.
 */
export function StatsRow({ title }: { title: string }) {
  const t = useTranslations('stats')

  return (
    <section className="border-y border-surface-line bg-surface-alt py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="text-center text-lg font-medium text-slate-muted">{title}</h2>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.key} className="group cursor-default">
              <dd>
                <Counter to={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-2 text-sm leading-snug text-slate-muted transition-colors duration-300 group-hover:text-brand-600 sm:text-base">
                {t(stat.key)}
              </dt>
              {/* Hairline rule that thickens and turns blue on hover. */}
              <span
                aria-hidden
                className="mt-4 block h-px w-full origin-left bg-surface-line transition-all duration-300 group-hover:h-0.5 group-hover:bg-brand-500"
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Counts up once, the first time it scrolls into view. */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to)
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true

        const duration = 1400
        const start = performance.now()

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          // easeOutExpo — quick start, gentle settle
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          setValue(Math.round(eased * to))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [to])

  return (
    <span
      ref={ref}
      className="block text-4xl font-bold tabular-nums text-ink transition-colors duration-300 group-hover:text-brand-600 sm:text-5xl lg:text-6xl"
    >
      {value}
      {suffix}
    </span>
  )
}
