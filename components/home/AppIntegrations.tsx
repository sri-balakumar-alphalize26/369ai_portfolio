'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

/**
 * "Every app you run. Every tool you use." — the 369ai.Biz app suite and the
 * tools it integrates with, converging on one core.
 *
 * Replaces the 863KB GIF this started as. Everything here is real text and
 * vector art, so it scales at any size, translates with the rest of the site,
 * and Google can read it. Styles live in globals.css under `.integrations`.
 *
 * The connecting wires are drawn at runtime from the measured tile centres —
 * that is the one thing CSS cannot do, since the positions depend on the
 * responsive layout.
 */
export function AppIntegrations() {
  const t = useTranslations('integrations')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Coordinates must be measured against #stage — the SVG is absolutely
    // positioned inside it. Measuring against an outer wrapper offsets every
    // point by the height of the heading block.
    const stage = root.querySelector<HTMLElement>('#stage')
    const svg = root.querySelector<SVGSVGElement>('#wires')
    const core = root.querySelector<HTMLElement>('#core')
    if (!stage || !svg || !core) return

    /** Centre of each tile in a rail, relative to the stage. */
    function centres(railId: string) {
      const rail = stage!.querySelector<HTMLElement>('#' + railId)
      if (!rail) return []
      const box = stage!.getBoundingClientRect()
      return Array.from(rail.querySelectorAll<HTMLElement>('.tile')).map((tile) => {
        const r = tile.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
      })
    }

    /** Catmull-Rom through every point, so the wire flows rather than kinks. */
    function spline(pts: { x: number; y: number }[]) {
      if (pts.length < 2) return ''
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[i + 2] ?? pts[i + 1]
        const c1x = p1.x + (p2.x - p0.x) / 6
        const c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6
        const c2y = p2.y - (p3.y - p1.y) / 6
        d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)},${c2x.toFixed(1)} ${c2y.toFixed(1)},${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
      }
      return d
    }

    function build() {
      const box = stage!.getBoundingClientRect()
      if (box.width < 2) return
      svg!.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)

      const card = core!.querySelector<HTMLElement>('.card')
      if (!card) return
      const cr = card.getBoundingClientRect()
      const coreC = {
        x: cr.left - box.left + cr.width / 2,
        y: cr.top - box.top + cr.height / 2,
      }

      const rails: [string, string, string, number][] = [
        ['railA', 'pathA', 'glowA', -1],
        ['railB', 'pathB', 'glowB', 1],
      ]

      for (const [railId, pathId, glowId, dir] of rails) {
        const pts = centres(railId)
        if (!pts.length) continue

        // Alternate each tile a few pixels up/down so the wire visibly weaves
        // through them instead of running dead straight.
        const weaved = pts.map((pt, i) => ({ x: pt.x, y: pt.y + (i % 2 ? 10 : -10) }))
        const lead = { x: -Math.max(40, box.width * 0.045), y: weaved[0].y + dir * 26 }
        const bend = {
          x: (weaved[weaved.length - 1].x + coreC.x) / 2 + 14,
          y: (weaved[weaved.length - 1].y + coreC.y) / 2 - dir * 10,
        }
        const d = spline([lead, ...weaved, bend, coreC])

        const base = svg!.querySelector<SVGPathElement>('#' + pathId)
        const glow = svg!.querySelector<SVGPathElement>('#' + glowId)
        if (!base || !glow) continue

        base.setAttribute('d', d)
        glow.setAttribute('d', d)
        const len = Math.ceil(base.getTotalLength()) + 4
        base.style.setProperty('--len', `${len}px`)
        glow.style.setProperty('--len', `${len}px`)
      }
    }

    build()
    // Web fonts change label widths, which moves the tiles — redraw once settled.
    document.fonts?.ready.then(build).catch(() => {})

    const observer = new ResizeObserver(build)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden bg-surface-alt">
      <div ref={rootRef}>
      <div className="integrations">
        <div className="head">
              <h2>
                {t('title')} <em>{t('titleAccent')}</em>
              </h2>
              <p>{t('body')}</p>
            </div>

            <div className="stage" id="stage">
          <svg className="wires" id="wires" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f47b20" stopOpacity="0"/>
                <stop offset="45%" stopColor="#f47b20"/>
                <stop offset="100%" stopColor="#1668c9"/>
              </linearGradient>
              <linearGradient id="gradB" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1668c9" stopOpacity="0"/>
                <stop offset="45%" stopColor="#2f8ce8"/>
                <stop offset="100%" stopColor="#f47b20"/>
              </linearGradient>
            </defs>
            <path className="wire-base a" id="pathA"></path>
            <path className="wire-base b" id="pathB"></path>
            <path className="wire-glow a" id="glowA" stroke="url(#gradA)"></path>
            <path className="wire-glow b" id="glowB"></path>
          </svg>

          <div className="rails">
            <div>
              <span className="chip" style={{ animationDelay: '.2s' }}>{t('appsChip')}</span>
              <div className="rail" id="railA">

                <div className="node" style={{ animationDelay: '.45s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <circle cx="21" cy="21" r="15" fill="#1668c9"/>
                      <circle cx="21" cy="21" r="11" fill="#fff"/>
                      <path d="M21 14v7.4l5 3" stroke="#1668c9" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
                      <circle cx="36" cy="36" r="9.5" fill="#f47b20"/>
                      <path d="M32 36l2.8 2.8L40 33.4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.attendance')}</span>
                </div>

                <div className="node" style={{ animationDelay: '.63s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M6 12a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H16l-7 6v-6h-1a2 2 0 0 1-2-2z" fill="#1668c9"/>
                      <circle cx="14" cy="17.5" r="2.1" fill="#fff"/><circle cx="20" cy="17.5" r="2.1" fill="#fff"/><circle cx="26" cy="17.5" r="2.1" fill="#fff"/>
                      <path d="M42 26v10a3 3 0 0 1-3 3H27l-6 5v-5h-.5a2.5 2.5 0 0 1-2.5-2.5V26a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3z" fill="#f47b20"/>
                      <circle cx="26" cy="31.5" r="1.9" fill="#fff"/><circle cx="31.5" cy="31.5" r="1.9" fill="#fff"/><circle cx="37" cy="31.5" r="1.9" fill="#fff"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.chats')}</span>
                </div>

                <div className="node" style={{ animationDelay: '.81s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <rect x="20.5" y="8" width="7" height="6" rx="3.5" fill="#f47b20"/>
                      <path d="M6 33a18 18 0 0 1 36 0z" fill="#f47b20"/>
                      <path d="M8 30.5a16 16 0 0 1 32 0" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".45"/>
                      <rect x="4" y="34" width="40" height="5.5" rx="2.75" fill="#1668c9"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.restaurant')}</span>
                </div>

                <div className="node" style={{ animationDelay: '.99s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M31.6 6.6a10 10 0 0 0-11.9 13l-12 12a3.9 3.9 0 1 0 5.5 5.5l12-12a10 10 0 0 0 13-11.9l-5.8 5.8-4.6-1.2-1.2-4.6z" fill="#1668c9"/>
                      <path d="M13.6 8.6 8.4 13.8l3 8.4 5.6 5.6 5-5-5.6-5.6z" fill="#f47b20"/>
                      <path d="m28.5 28.5 9.6 9.6a3.6 3.6 0 0 0 5.1-5.1l-9.6-9.6z" fill="#f47b20"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.toolsRental')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.17s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M24 5c5 6 7 11 7 15s-3 8-7 8-7-4-7-8 2-9 7-15z" fill="#f47b20"/>
                      <path d="M12 15c5.5 2.2 8.2 5.4 9.2 8.4S21 30 18 31 10 29 8.6 25.8 8.6 18 12 15z" fill="#1668c9"/>
                      <path d="M36 15c-5.5 2.2-8.2 5.4-9.2 8.4S27 30 30 31s8-2 9.4-5.2S39.4 18 36 15z" fill="#2f8ce8"/>
                      <path d="M8 36c4-2.6 8-2.6 12 0s8 2.6 12 0 8-2.6 12 0" fill="none" stroke="#1668c9" strokeWidth="2.6" strokeLinecap="round"/>
                      <path d="M8 42c4-2.6 8-2.6 12 0s8 2.6 12 0 8-2.6 12 0" fill="none" stroke="#9dc7f2" strokeWidth="2.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.spa')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.35s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <rect x="3" y="14" width="24" height="17" rx="3" fill="#1668c9"/>
                      <path d="M27 19h7.6a3 3 0 0 1 2.5 1.3l5.4 7.6a3 3 0 0 1 .5 1.7V31H27z" fill="#f47b20"/>
                      <rect x="3" y="31" width="42" height="4" rx="2" fill="#0f4f9e"/>
                      <circle cx="13" cy="37" r="5" fill="#12325b"/><circle cx="13" cy="37" r="2" fill="#fff"/>
                      <circle cx="35" cy="37" r="5" fill="#12325b"/><circle cx="35" cy="37" r="2" fill="#fff"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.vanSale')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.53s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <rect x="8" y="7" width="28" height="34" rx="4" fill="#1668c9"/>
                      <rect x="15" y="4" width="14" height="7" rx="2.6" fill="#f47b20"/>
                      <rect x="13" y="17" width="18" height="2.8" rx="1.4" fill="#fff" opacity=".9"/>
                      <rect x="13" y="23.5" width="18" height="2.8" rx="1.4" fill="#fff" opacity=".65"/>
                      <rect x="13" y="30" width="11" height="2.8" rx="1.4" fill="#fff" opacity=".45"/>
                      <circle cx="35" cy="35" r="9.5" fill="#f47b20"/>
                      <path d="M31 35l2.8 2.8L39 32.4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.taskManager')}</span>
                </div>

              </div>
            </div>

            <div>
              <span className="chip muted" style={{ animationDelay: '.3s' }}>{t('toolsChip')}</span>
              <div className="rail" id="railB">

                <div className="node" style={{ animationDelay: '1.05s' }}>
                  <div className="tile">
                    {/* Odoo wordmark, drawn rather than imported so it matches
                        every other tile here (all inline SVG) and stays crisp
                        at any tile size. Wide viewBox: the mark is ~4:1. */}
                    <svg viewBox="0 0 89 26" className="odoo-mark">
                      <g fill="none" strokeWidth="5.4">
                        <circle cx="13" cy="16" r="7.4" stroke="#A0538F" />
                        <circle cx="34" cy="16" r="7.4" stroke="#949497" />
                        <circle cx="55" cy="16" r="7.4" stroke="#949497" />
                        <circle cx="76" cy="16" r="7.4" stroke="#949497" />
                      </g>
                      {/* the ascender that turns the second ring into a "d" */}
                      <rect x="38.7" y="1" width="5.4" height="16" rx="2.7" fill="#949497" />
                    </svg>
                  </div>
                  <span className="label">{t('apps.odoo')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.23s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M24 4C12.95 4 4 12.95 4 24c0 3.52.92 6.83 2.53 9.7L4 44l10.6-2.47A19.9 19.9 0 0 0 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4z" fill="#25D366"/>
                      <path d="M33.6 28.3c-.5-.25-2.98-1.47-3.44-1.64-.46-.17-.8-.25-1.13.25-.33.5-1.3 1.64-1.6 1.98-.29.33-.59.37-1.1.12-.5-.25-2.12-.78-4.04-2.5-1.5-1.33-2.5-2.98-2.8-3.48-.29-.5-.03-.77.22-1.02.23-.22.5-.58.75-.87.25-.29.33-.5.5-.83.17-.33.08-.62-.04-.87-.12-.25-1.13-2.72-1.55-3.72-.4-.98-.82-.85-1.13-.87h-.96c-.33 0-.87.12-1.33.62-.46.5-1.75 1.7-1.75 4.15s1.79 4.81 2.04 5.15c.25.33 3.52 5.37 8.52 7.53 1.19.51 2.12.82 2.84 1.05 1.2.38 2.28.33 3.14.2.96-.14 2.98-1.22 3.4-2.4.42-1.18.42-2.18.29-2.4-.12-.2-.46-.33-.96-.58z" fill="#fff"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.whatsapp')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.41s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3z" fill="#4caf50"/>
                      <path d="M3 16.2l3.614 1.71L13 18.95V40H6c-1.657 0-3-1.343-3-3z" fill="#1e88e5"/>
                      <polygon points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" fill="#e53935"/>
                      <path d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859A4.3 4.3 0 0 0 7.298 8 4.298 4.298 0 0 0 3 12.298z" fill="#c62828"/>
                      <path d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341A4.3 4.3 0 0 1 40.702 8 4.298 4.298 0 0 1 45 12.298z" fill="#fbc02d"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.email')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.59s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <rect x="3" y="10" width="42" height="28" rx="5" fill="#1668c9"/>
                      <rect x="3" y="16" width="42" height="5.5" fill="#0f4f9e"/>
                      <rect x="8" y="27" width="13" height="3.4" rx="1.7" fill="#fff" opacity=".85"/>
                      <circle cx="31" cy="29.5" r="6.6" fill="#f7a94f"/>
                      <circle cx="37.5" cy="29.5" r="6.6" fill="#f47b20"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.payments')}</span>
                </div>

                <div className="node" style={{ animationDelay: '1.77s' }}>
                  <div className="tile">
                    <svg viewBox="0 0 48 48">
                      <path d="M24 4l16 6v12c0 10.2-6.8 19.3-16 22-9.2-2.7-16-11.8-16-22V10z" fill="#1668c9"/>
                      <path d="M24 4v40c9.2-2.7 16-11.8 16-22V10z" fill="#0f4f9e"/>
                      <rect x="16" y="22" width="16" height="13" rx="3" fill="#fff"/>
                      <path d="M19.5 22v-3.5a4.5 4.5 0 0 1 9 0V22" fill="none" stroke="#fff" strokeWidth="2.6"/>
                      <circle cx="24" cy="28.5" r="2.2" fill="#f47b20"/>
                    </svg>
                  </div>
                  <span className="label">{t('apps.security')}</span>
                </div>

              </div>
            </div>
          </div>

          <div className="core" id="core">
            <div className="card">
              <span className="ring"></span><span className="ring b"></span>
              <img src="/images/brand/logo-369ai.png" width={353} height={334} alt="369ai.Biz" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
