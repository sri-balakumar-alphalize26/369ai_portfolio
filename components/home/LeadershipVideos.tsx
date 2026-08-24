'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import {
  LEADERSHIP_VIDEOS,
  YOUTUBE_CHANNEL,
  thumbnailUrl,
  embedUrl,
  viewLabel,
  type Video,
} from '@/content/videos'
import { MarqueeInView } from '@/components/ui/MarqueeInView'

/**
 * Auto-scrolling video rail (right → left), same marquee mechanic as the
 * technology strip. Hovering pauses it, lifts the hovered card and blurs its
 * neighbours (a spotlight). Clicking opens a lightbox rather than playing in
 * the card — the cards are ~22rem and moving, which is no way to watch a talk.
 *
 * Facade loading: only thumbnails ship with the page; the YouTube iframe mounts
 * when the lightbox opens, so no YouTube cookies are set unless someone watches.
 */
export function LeadershipVideos() {
  const [active, setActive] = useState<Video | null>(null)

  /** Feedback while the channel opens in its new tab — decorative, not a gate. */
  const [opening, setOpening] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // One attention pulse when the link scrolls ~60% into view, then never again.
  useEffect(() => {
    const el = linkRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('pulse-once')
          observer.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Reset the loading state after a beat, and immediately when the page is
  // restored from the back/forward cache.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setOpening(false)
    }
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  function onOpenChannel() {
    setOpening(true)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setOpening(false), 4000)
  }

  return (
    <MarqueeInView className="relative">
      <div className="marquee-viewport video-rail overflow-hidden py-4">
        <div
          className="marquee-track items-stretch"
          style={{ ['--marquee-duration' as string]: '65s' }}
        >
          {/* Tripled so the -66.666% loop point is seamless; copies 2-3 are
              hidden from screen readers. */}
          {LEADERSHIP_VIDEOS.map((video) => (
            <VideoCard key={video.id} video={video} onOpen={() => setActive(video)} />
          ))}
          {[1, 2].map((copy) => (
            <div key={copy} aria-hidden className="contents">
              {LEADERSHIP_VIDEOS.map((video) => (
                <VideoCard
                  key={`${video.id}-${copy}`}
                  video={video}
                  onOpen={() => setActive(video)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Edge fade lives on .marquee-viewport as a mask now. */}

      <div className="mt-8 text-center">
        <a
          ref={linkRef}
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpenChannel}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
        >
          {opening ? <span className="yt-spin" aria-hidden /> : <YouTubeMark />}
          {opening ? 'Opening YouTube…' : 'More on our YouTube channel'}
        </a>
      </div>

      <Lightbox video={active} onClose={() => setActive(null)} />
    </MarqueeInView>
  )
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  return (
    <div className="video-card mx-2.5 w-[19rem] shrink-0 sm:w-[22rem]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Play ${video.title}`}
        className="group block w-full overflow-hidden rounded-panel border border-surface-line bg-white text-start shadow-sm"
      >
        <span className="relative block aspect-video bg-brand-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl(video.id)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-brand-950/25 transition-colors group-hover:bg-brand-950/5" />
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-orange-900/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="ms-0.5 h-6 w-6 fill-current" aria-hidden />
          </span>
        </span>

        <span className="block p-4">
          <span className="block truncate font-semibold text-ink">{video.title}</span>
          <span className="mt-1 block text-sm text-slate-muted">
            {video.note}
            {video.note && viewLabel(video.views) ? ' · ' : ''}
            {viewLabel(video.views)}
          </span>
        </span>
      </button>
    </div>
  )
}

function Lightbox({ video, onClose }: { video: Video | null; onClose: () => void }) {
  // Escape closes; the page behind is locked while it is open.
  useEffect(() => {
    if (!video) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [video, onClose])

  if (!video) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
    >
      {/* Blurred, dimmed backdrop — the page behind is visibly out of focus. */}
      <div
        className="absolute inset-0 bg-brand-950/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative w-full max-w-4xl"
        style={{ animation: 'word-rise .4s var(--ease-out-soft) both' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-11 end-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="overflow-hidden rounded-panel bg-black shadow-2xl">
          <div className="relative aspect-video">
            <iframe
              src={embedUrl(video.id)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-white">{video.title}</p>
          <p className="mt-1 text-sm text-brand-200">
            {video.note}
            {video.note && viewLabel(video.views) ? ' · ' : ''}
            {viewLabel(video.views)}
          </p>
        </div>
      </div>
    </div>
  )
}

/** lucide-react dropped its brand icons, so this one is an inline path. */
function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  )
}
