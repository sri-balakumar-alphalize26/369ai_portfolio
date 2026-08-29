'use client'

import { useEffect, useRef } from 'react'

/**
 * A heading whose lines roll up out of a mask, one after another.
 *
 * The text is rendered plainly on the server (so search engines and a
 * script-blocked browser get the real string), then split on mount into the
 * browser's ACTUAL line boxes — words are grouped by their offsetTop rather
 * than by guessed break points, so the mask can never clip mid-line at a
 * width nobody tested.
 *
 * The original string is kept in dataset.raw, so re-splitting on resize
 * starts from the source instead of compounding. aria-label on the heading
 * plus aria-hidden on the line wrappers means a screen reader hears one
 * sentence, not a pile of fragments.
 */
export function MaskedHeading({
  text,
  className,
  step = 90,
}: {
  text: string
  className?: string
  /** Delay between one line and the next. */
  step?: number
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function split() {
      const raw = el!.dataset.raw || el!.textContent?.trim() || ''
      if (!raw) return
      el!.dataset.raw = raw
      // Arms the mask only once this runs: without JS the plain heading is
      // already on screen, so a failure here can never hide the title.
      el!.classList.add('ln--armed')

      // lay the words out plainly so the browser decides the breaks
      el!.textContent = ''
      const words = raw.split(' ').map((w) => {
        const s = document.createElement('span')
        s.textContent = w
        el!.appendChild(s)
        el!.appendChild(document.createTextNode(' '))
        return s
      })

      const lines: string[][] = []
      let top: number | null = null
      words.forEach((w) => {
        const y = Math.round(w.offsetTop)
        if (y !== top) {
          lines.push([])
          top = y
        }
        lines[lines.length - 1].push(w.textContent || '')
      })

      el!.setAttribute('aria-label', raw)
      el!.textContent = ''
      lines.forEach((line, i) => {
        const outer = document.createElement('span')
        outer.className = 'ln'
        outer.setAttribute('aria-hidden', 'true')
        const inner = document.createElement('i')
        inner.textContent = line.join(' ')
        inner.style.setProperty('--d', `${i * step}ms`)
        outer.appendChild(inner)
        el!.appendChild(outer)
      })
    }

    split()

    // Reveals itself rather than waiting on the journey thread: if that
    // measurement never lands, the title would otherwise sit at 105% —
    // masked out of sight — for good.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-in')
        io.disconnect()
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    const failsafe = window.setTimeout(() => el.classList.add('is-in'), 2500)

    let rt = 0
    function onResize() {
      window.clearTimeout(rt)
      rt = window.setTimeout(split, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(rt)
    }
  }, [text, step])

  return (
    <h2 ref={ref} className={className}>
      {text}
    </h2>
  )
}
