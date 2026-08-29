'use client'

import { useEffect, useRef } from 'react'

/**
 * The events journey: a thread drawn down a reserved lane beside the content,
 * an arrow riding its tip as you scroll, and a bead at each event that pops
 * as the arrow arrives. A mini-map at the top mirrors the same progress.
 *
 * The wrapper is `position: relative` and nothing more — an `overflow` or
 * `perspective` here would become a containing block and break the sticky
 * card stack that lives inside these sections.
 *
 * Anchors come from the server-rendered markup: any `[data-anchor]` inside
 * becomes a point on the thread, `[data-bead]` also gets a bead, and
 * `[data-jr-reveal]` names what to unhide (NOT `data-reveal` —
 * the site already uses that attribute as a hide-until-shown flag) once the arrow reaches it.
 */
export function EventsJourney({
  title,
  nodes,
  children,
}: {
  title: string
  nodes: { key: string; date: string; label: string }[]
  children: React.ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const jr = root.current
    if (!jr) return

    const svg = jr.querySelector<SVGSVGElement>('.jr__svg')
    const track = jr.querySelector<SVGPathElement>('.jr__track')
    const glow = jr.querySelector<SVGPathElement>('.jr__glow')
    const draw = jr.querySelector<SVGPathElement>('.jr__draw')
    const beadG = jr.querySelector<SVGGElement>('.jr__beads')
    const arrow = jr.querySelector<SVGGElement>('.jr__arrow')
    const fill = jr.querySelector<HTMLElement>('.rm__fill')
    const marker = jr.querySelector<HTMLElement>('.rm__marker')
    if (!svg || !track || !glow || !draw || !beadG || !arrow) return

    const rtl = getComputedStyle(document.documentElement).direction === 'rtl'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function revealAll() {
      jr!.querySelectorAll('[data-jr-reveal]').forEach((el) => {
        const sel = (el as HTMLElement).dataset.jrReveal
        const targets = sel === 'self' ? [el] : Array.from(jr!.querySelectorAll(sel!))
        targets.forEach((t) => t.classList.add('is-in'))
      })
      jr!.querySelectorAll('.rm__node').forEach((n) => n.classList.add('is-in'))
      jr!.classList.add('is-in')
    }

    type Pt = { x: number; y: number; at: number; targets: Element[]; bead: boolean }
    let pts: Pt[] = []
    let beads: { el: SVGCircleElement; at: number }[] = []
    let len = 1
    let endY = Infinity // y of the dark CTA band, where the thread bows out

    /** The empty corridor beside the text column — mirrored under RTL. */
    function lane() {
      const col = jr!.querySelector('[data-lane]') as HTMLElement | null
      const box = jr!.getBoundingClientRect()
      if (!col) return { min: 16, max: 56 }
      const r = col.getBoundingClientRect()
      const cs = getComputedStyle(col)
      if (rtl) {
        const textEnds = r.right - (parseFloat(cs.paddingRight) || 0)
        const max = box.width - 14
        const min = Math.min(max - 6, textEnds - box.left + 20)
        return { min: max, max: min }
      }
      const textStarts = r.left - box.left + (parseFloat(cs.paddingLeft) || 0)
      const min = 14
      return { min, max: Math.max(min + 6, textStarts - 20) }
    }

    function build() {
      const box = jr!.getBoundingClientRect()
      const top = window.scrollY + box.top
      const ln = lane()
      svg!.setAttribute('viewBox', `0 0 ${jr!.offsetWidth} ${jr!.offsetHeight}`)

      const anchors = Array.from(jr!.querySelectorAll<HTMLElement>('[data-anchor]'))
      const raw = anchors.map((el) => {
        const r = el.getBoundingClientRect()
        const bias = parseFloat(el.dataset.bias || '0.5')
        const sel = el.dataset.jrReveal
        return {
          x: ln.min + (ln.max - ln.min) * bias,
          y: window.scrollY + r.top - top + r.height / 2,
          targets: sel
            ? sel === 'self'
              ? [el as Element]
              : Array.from(jr!.querySelectorAll(sel))
            : [],
          bead: el.hasAttribute('data-bead'),
          at: 0,
        }
      })
      if (raw.length < 2) return

      const span = raw[raw.length - 1].y - raw[0].y || 1
      pts = raw.map((p) => ({ ...p, at: (p.y - raw[0].y) / span }))

      let d = `M ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const m = (b.y - a.y) * 0.5
        d += ` C ${a.x} ${a.y + m}, ${b.x} ${b.y - m}, ${b.x} ${b.y}`
      }
      track!.setAttribute('d', d)
      glow!.setAttribute('d', d)
      draw!.setAttribute('d', d)
      len = draw!.getTotalLength()

      const end = jr!.querySelector('[data-thread-end]')
      endY = end
        ? window.scrollY + end.getBoundingClientRect().top - top
        : Infinity

      beadG!.innerHTML = ''
      beads = []
      pts.forEach((p) => {
        if (!p.bead) return
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        c.setAttribute('class', 'jr__bead')
        c.setAttribute('cx', String(p.x))
        c.setAttribute('cy', String(p.y))
        c.setAttribute('r', '7')
        beadG!.appendChild(c)
        beads.push({ el: c, at: p.at })
      })
    }

    function update() {
      const box = jr!.getBoundingClientRect()
      const vh = window.innerHeight
      let p = (-box.top + vh * 0.72) / (jr!.offsetHeight - vh * 0.28)
      p = Math.max(0, Math.min(1, p))

      draw!.style.strokeDashoffset = String(1 - p)
      glow!.style.strokeDashoffset = String(1 - p)
      jr!.classList.toggle('is-live', p > 0.01 && p < 0.995)

      if (len) {
        const pt = draw!.getPointAtLength(len * p)
        const nx = draw!.getPointAtLength(Math.min(len, len * p + 2))
        const ang = (Math.atan2(nx.y - pt.y, nx.x - pt.x) * 180) / Math.PI
        arrow!.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${ang})`)

        // Bow out just above the dark band rather than running into it.
        // Derived from the tip's position, so scrolling back up restores it
        // without any latched state.
        const fade = Number.isFinite(endY)
          ? Math.max(0, Math.min(1, (endY - pt.y) / 220))
          : 1
        jr!.style.setProperty('--thread-fade', fade.toFixed(3))
      }

      beads.forEach((b) => {
        b.el.classList.toggle('is-on', p >= b.at - 0.018)
        b.el.classList.toggle('is-done', p >= b.at + 0.012)
      })

      pts.forEach((pt) => {
        if (p >= pt.at) pt.targets.forEach((t) => t.classList.add('is-in'))
      })

      if (fill) {
        const pct = (p * 100).toFixed(1)
        fill.style.width = `${pct}%`
        if (marker) marker.style.insetInlineStart = `calc(${pct}% - ${(p * 10).toFixed(1)}px)`
      }
    }

    jr.classList.add('jr--anim')

    if (reduced) {
      build()
      revealAll()
      draw.style.strokeDashoffset = '0'
      glow.style.strokeDashoffset = '0'
      if (fill) fill.style.width = '100%'
      return
    }

    build()
    update()

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }
    let rt = 0
    function onResize() {
      window.clearTimeout(rt)
      rt = window.setTimeout(() => {
        build()
        update()
      }, 150)
    }
    // Nothing should stay hidden because a measurement went wrong.
    const failsafe = window.setTimeout(revealAll, 5000)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('load', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', onResize)
      window.clearTimeout(rt)
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <div ref={root} className="jr">
      <svg className="jr__svg" aria-hidden>
        <path className="jr__track" />
        <path className="jr__glow" pathLength={1} />
        <path className="jr__draw" pathLength={1} />
        <g className="jr__beads" />
        <g className="jr__arrow">
          <circle className="disc" r={11} />
          <circle className="ring" r={12} />
          <path className="head" d="M -6 -6.5 L 8.5 0 L -6 6.5 L -2.5 0 Z" />
        </g>
      </svg>

      <p className="jr__kick">{title}</p>

      {/* mini-map: the same progress, read at a glance */}
      <div className="rm" data-anchor data-bias="0.34" data-jr-reveal="self">
        <div className="rm__line" />
        <div className="rm__dash" />
        <div className="rm__fill" />
        <div className="rm__marker" />
        {nodes.map(({ key, date, label }, i) => (
          <div
            key={key}
            className="rm__node"
            style={{ insetInlineStart: `${nodes.length === 1 ? 50 : 26 + i * 48}%` }}
          >
            <a href={`#${key}`} className="rm__dot" aria-label={label}>
              <span className="rm__halo" aria-hidden />
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 13 4 4L19 7" />
              </svg>
            </a>
            <p className="rm__date">{date}</p>
            <p className="rm__name">{label}</p>
          </div>
        ))}
      </div>

      {children}
    </div>
  )
}
