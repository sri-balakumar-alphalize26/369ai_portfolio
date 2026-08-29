'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { AmbientVideo } from '@/components/ui/AmbientVideo'
import { useCardStack } from '@/lib/use-card-stack'
import { cn } from '@/lib/cn'

/**
 * The floor clips as a scroll-stacking deck: a portrait clip beside its own
 * copy, media side alternating down the pile. Each card pins slightly lower
 * than the one before (--i in globals.css) so the covered cards keep a
 * visible edge above the front one, and only the front clip decodes.
 */
export function VideoStack({
  videos,
  playLabel,
  pauseLabel,
  unmuteLabel,
  muteLabel,
}: {
  videos: { src: string; key?: string; portrait?: boolean }[]
  playLabel: string
  pauseLabel: string
  unmuteLabel: string
  muteLabel: string
}) {
  const t = useTranslations('events')
  const ref = useRef<HTMLDivElement>(null)
  useCardStack(ref, { pauseCoveredVideos: true })

  return (
    <div ref={ref} className="card-stack mt-6">
      {videos.map(({ src, key, portrait }, i) => (
        <article
          key={src}
          className="stack-card overflow-hidden rounded-panel border border-surface-line bg-white p-6 shadow-xl sm:p-8"
          style={{ '--i': i } as React.CSSProperties}
        >
          <div
            className={cn(
              'grid items-center gap-7 sm:gap-9',
              // Mutually exclusive, never base + override: two sm:grid-cols-*
              // classes on one element resolve by their order in the built
              // stylesheet, not by the order written here — which put the
              // even cards' text in the 200px column and left half the card
              // empty. The odd card also flips the clip to the far side.
              i % 2 === 0
                ? 'sm:grid-cols-[200px_1fr]'
                : 'sm:grid-cols-[1fr_200px] sm:[&>*:first-child]:order-2'
            )}
          >
            <div
              className={cn(
                'mx-auto w-full overflow-hidden rounded-card bg-brand-950 sm:mx-0',
                portrait ? 'aspect-[9/16] max-w-[200px]' : 'aspect-video'
              )}
            >
              <AmbientVideo
                src={src}
                managed
                className="h-full"
                playLabel={playLabel}
                pauseLabel={pauseLabel}
                unmuteLabel={unmuteLabel}
                muteLabel={muteLabel}
              />
            </div>

            {key ? (
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-brand-600">
                  {t('clipEyebrow')}
                </p>
                <h4 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  {t(`items.expo2025.clips.${key}.title`)}
                </h4>
                <p className="mt-3 leading-relaxed text-slate-muted">
                  {t(`items.expo2025.clips.${key}.body`)}
                </p>
              </div>
            ) : (
              <div />
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
