'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * A video that behaves like a GIF: a muted loop that plays only while the
 * card is on screen (IntersectionObserver), with no native chrome — so no
 * download / picture-in-picture menu, and right-click save is blocked.
 * Hovering reveals a centre play button (first press restarts the film WITH
 * sound; then it toggles pause) and a corner speaker that toggles sound
 * without restarting. Under prefers-reduced-motion nothing autoplays: the
 * first frame sits still until the visitor presses play.
 *
 * `muted` is also set imperatively — React does not reliably emit the muted
 * attribute into server HTML, and browsers only allow autoplay when the
 * element is muted from the first frame.
 */
export function AmbientVideo({
  src,
  className,
  managed = false,
  playLabel,
  pauseLabel,
  unmuteLabel,
  muteLabel,
}: {
  src: string
  className?: string
  /**
   * The parent decides when this clip plays (the card stack does, so only
   * the front card ever loads). Skips this component's own in-view autoplay.
   */
  managed?: boolean
  playLabel: string
  pauseLabel: string
  unmuteLabel: string
  muteLabel: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true

    // Icons follow the element, not our guesses — the browser may refuse
    // or interrupt playback on its own.
    const onPlay = () => setPaused(false)
    const onPause = () => setPaused(true)
    const onVolume = () => setMuted(v.muted)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('volumechange', onVolume)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.preload = 'metadata'
      return () => {
        v.removeEventListener('play', onPlay)
        v.removeEventListener('pause', onPause)
        v.removeEventListener('volumechange', onVolume)
      }
    }

    // Managed clips are played by the parent — starting them here too would
    // begin a fetch the stack immediately aborts when the card is covered.
    if (managed) {
      return () => {
        v.removeEventListener('play', onPlay)
        v.removeEventListener('pause', onPause)
        v.removeEventListener('volumechange', onVolume)
      }
    }

    // Ambient loop only while on screen: the file is neither fetched nor
    // decoded for a card the visitor has not scrolled to.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.preload = 'auto'
          v.play().catch(() => undefined)
        } else if (!v.paused) {
          v.pause()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(v)

    return () => {
      observer.disconnect()
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('volumechange', onVolume)
    }
  }, [managed])

  function togglePlay() {
    const v = ref.current
    if (!v) return
    if (!started) {
      // First deliberate press: watch it properly — from the top, with sound.
      v.muted = false
      v.currentTime = 0
      v.play().catch(() => undefined)
      setStarted(true)
      return
    }
    if (v.paused) v.play().catch(() => undefined)
    else v.pause()
  }

  function toggleSound() {
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    if (v.paused) v.play().catch(() => undefined)
  }

  const showPlay = paused || !started

  return (
    <div className="group relative h-full">
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        controlsList="nodownload noremoteplayback noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        className={cn('block w-full object-contain', className)}
      />

      {/* Centre play/pause — appears on hover or keyboard focus. */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={showPlay ? playLabel : pauseLabel}
        className="absolute inset-0 flex items-center justify-center bg-brand-950/0 opacity-0 transition-[opacity,background-color] duration-300 focus-visible:opacity-100 group-hover:bg-brand-950/25 group-hover:opacity-100"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-lg shadow-brand-950/30 transition-transform group-hover:scale-105">
          {showPlay ? (
            <Play className="ms-0.5 h-6 w-6" aria-hidden />
          ) : (
            <Pause className="h-6 w-6" aria-hidden />
          )}
        </span>
      </button>

      {/* Corner speaker — sound on/off without restarting. */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? unmuteLabel : muteLabel}
        aria-pressed={!muted}
        className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-950/60 text-white opacity-70 backdrop-blur transition-opacity hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {muted ? (
          <VolumeX className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  )
}
