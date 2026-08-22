'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'

/** The words that cycle at the end of the headline. */
const ROTATING = ['POS', 'ERP', 'Automation', 'Retail', 'Vending', 'Robotics']

export function Hero({ base }: { base: string }) {
  const t = useTranslations('home')
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={heroRef}
      onMouseMove={(e) => {
        // Cursor spotlight — cheap, just two CSS vars.
        const el = heroRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }}
      className="relative isolate overflow-hidden bg-brand-950"
    >
      {/* ---- Animated aurora field ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="aurora-blob aurora-a h-[38rem] w-[38rem] opacity-45"
          style={{ top: '-14rem', insetInlineStart: '-8rem', background: '#0078a8' }}
        />
        <div
          className="aurora-blob aurora-b h-[32rem] w-[32rem] opacity-40"
          style={{ top: '4rem', insetInlineEnd: '-6rem', background: '#30a8c0' }}
        />
        <div
          className="aurora-blob aurora-c h-[26rem] w-[26rem] opacity-25"
          style={{ bottom: '-10rem', insetInlineStart: '38%', background: '#ff7800' }}
        />
      </div>

      {/* ---- Drifting dot grid ---- */}
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />

      {/* ---- Cursor spotlight ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx, 50%) var(--my, 40%), rgba(96,192,216,0.16), transparent 70%)',
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 pb-24 pt-32 sm:px-8 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-32 lg:pt-40">
        <div>
          <p
            className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 backdrop-blur"
            style={{ animation: 'word-rise 0.6s var(--ease-out-soft) both' }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="ring-pulse absolute inline-flex h-full w-full rounded-full bg-accent-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-400" />
            </span>
            {t('heroEyebrow')}
          </p>

          <h1 className="mt-7 text-[2.6rem] font-bold leading-[1.06] text-white sm:text-6xl lg:text-[4.1rem]">
            <WordRise text={t('heroTitle')} />
            <span className="mt-2 block text-[0.62em] font-semibold text-slate-400">
              of <RotatingWord />
            </span>
          </h1>

          <p
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300"
            style={{ animation: 'word-rise 0.8s var(--ease-out-soft) 0.5s both' }}
          >
            {t('heroBody')}
          </p>

          <div
            className="mt-10 flex flex-wrap gap-3"
            style={{ animation: 'word-rise 0.8s var(--ease-out-soft) 0.65s both' }}
          >
            <ButtonLink
              href={`${base}/solutions`}
              variant="accent"
              size="lg"
              className="shimmer relative overflow-hidden"
            >
              {t('heroPrimary')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </ButtonLink>
            <ButtonLink href={`${base}/contact`} variant="onDark" size="lg">
              {t('heroSecondary')}
            </ButtonLink>
          </div>

          {/* Brand promise straight off the logo. */}
          <p
            className="mt-9 text-sm italic text-brand-200/70"
            style={{ animation: 'word-rise 0.8s var(--ease-out-soft) 0.8s both' }}
          >
            Beyond control. Beyond growth.
          </p>
        </div>

        {/* Client-supplied animated ecosystem diagram, retinted to the site
            palette. Loaded as <img> so its internal CSS animations still run
            while staying out of the DOM. */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/hub-dark.svg"
            alt="369AI platform: POS terminals, smart vending, smart locks, networking, AI-driven insights and secure cloud connected through one hub"
            width={1600}
            height={1160}
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Curved cut into the next section — softer than a hard edge. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-12 w-full sm:h-20"
      >
        <path d="M0,80 C360,10 1080,10 1440,80 L1440,80 L0,80 Z" fill="var(--color-surface-alt)" />
      </svg>
    </section>
  )
}

/** Splits a headline into words that rise in one after another. */
function WordRise({ text }: { text: string }) {
  return (
    <span className="word-rise">
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} style={{ animationDelay: `${i * 80}ms` }}>
          {word}
          {i < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

function RotatingWord() {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cycle = setInterval(() => {
      setLeaving(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING.length)
        setLeaving(false)
      }, 400)
    }, 2600)
    return () => clearInterval(cycle)
  }, [])

  return (
    <span className="relative inline-block min-w-[6ch] align-top">
      <span key={index} className={leaving ? 'word-out gradient-text' : 'word-in gradient-text'}>
        {ROTATING[index]}
      </span>
    </span>
  )
}
