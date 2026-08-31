'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { SOCIALS } from '@/content/socials'
import { IconRow, ICON_STEP } from './IconRow'
import { SummarizeWithAi } from './SummarizeWithAi'

/**
 * The footer's left column, revealed as one arrival: the contact details —
 * passed in as children, so the Hiring badge is inside the block and sweeps
 * once as it lands — then the social accounts, then the AI assistants.
 *
 * One observer for all of it. Two rows with an observer each, which is what
 * this replaced, both started at 0ms: the assistants popped over the top of
 * the accounts instead of following them. AI_BASE is derived from the number
 * of accounts, so a fifth one pushes the assistants back on its own.
 *
 * Armed rather than hidden: `is-armed` is added by this effect and is what
 * hides the marks, so a script that never runs leaves the footer visible
 * rather than blank. Reduced motion never arms at all.
 */
const SOCIAL_BASE = 180
const AI_BASE = SOCIAL_BASE + SOCIALS.length * ICON_STEP + 120

export function FooterSocial({ children }: { children: ReactNode }) {
  const t = useTranslations('footer')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const block = ref.current
    if (!block) return

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    block.classList.add('is-armed')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        block.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.25 }
    )
    io.observe(block)

    // Never leave the marks invisible, whatever the observer does.
    const failsafe = window.setTimeout(() => block.classList.add('is-in'), 3000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <div ref={ref} className="fsoc">
      {children}
      <IconRow variant="social" label={t('follow')} items={SOCIALS} delay={SOCIAL_BASE} />
      <SummarizeWithAi delay={AI_BASE} />
    </div>
  )
}
