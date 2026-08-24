'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Mail,
  QrCode,
  CreditCard,
  KeyRound,
  Lock,
  Fingerprint,
  MapPin,
  BarChart3,
  Bot,
  Smartphone,
  Globe,
  Cpu,
  type LucideIcon,
} from 'lucide-react'

/**
 * "Client requirements to outputs" — client-supplied animation, rebuilt from
 * their HTML mock (Tabler icon font, fixed 680px canvas, hardcoded English)
 * onto the site's stack: lucide icons, message-catalog labels, and a stage
 * that starts when scrolled into view.
 *
 * The geometry is the client's: a fixed 680x318 canvas with absolutely
 * positioned tiles and hand-drawn SVG wires weaving through both rows into
 * the hub, then three output cards. Their heading block is replaced by the
 * page's own SectionHeader, so the canvas is shifted up 60px and cropped to
 * 258px. Rather than reflowing all of that responsively, the whole stage
 * scales down as one unit below 680px — it is a diagram, not a layout.
 *
 * The travelling dots are SMIL (animateMotion along the wire paths) — the
 * SVG timeline is paused on mount and released when the stage first enters
 * the viewport, so begin-times count from reveal, not page load. The
 * diagram reads left-to-right by construction (wires are drawn in those
 * coordinates), hence dir="ltr"; labels still come from the catalogs.
 */

const BLUE = '#185FA5'
const ORANGE = '#E08A17'

type Item = { key: string; Icon?: LucideIcon; color: string; left: number; delay: number }

const ROW1: Item[] = [
  { key: 'whatsapp', color: '#25A75A', left: 4, delay: 0.3 }, // inline brand mark
  { key: 'email', Icon: Mail, color: '#D8503F', left: 78, delay: 0.4 },
  { key: 'qr', Icon: QrCode, color: BLUE, left: 152, delay: 0.5 },
  { key: 'payments', Icon: CreditCard, color: ORANGE, left: 226, delay: 0.6 },
  { key: 'access', Icon: KeyRound, color: BLUE, left: 300, delay: 0.7 },
]

const ROW2: Item[] = [
  { key: 'lockScreen', Icon: Lock, color: BLUE, left: 4, delay: 0.48 },
  { key: 'attendance', Icon: Fingerprint, color: ORANGE, left: 78, delay: 0.58 },
  { key: 'gps', Icon: MapPin, color: BLUE, left: 152, delay: 0.68 },
  { key: 'dashboards', Icon: BarChart3, color: ORANGE, left: 226, delay: 0.78 },
  { key: 'robots', Icon: Bot, color: BLUE, left: 300, delay: 0.88 },
]

const OUTPUTS = [
  { key: 'mobileApp', Icon: Smartphone, color: BLUE, top: 93, delay: 2.05 },
  { key: 'webPortal', Icon: Globe, color: BLUE, top: 153, delay: 2.2 },
  { key: 'hardware', Icon: Cpu, color: ORANGE, top: 213, delay: 2.35 },
] as const

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 48 48" width={26} height={26} aria-hidden>
      <path
        d="M24 4C12.95 4 4 12.95 4 24c0 3.52.92 6.83 2.53 9.7L4 44l10.6-2.47A19.9 19.9 0 0 0 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4z"
        fill="#25A75A"
      />
      <path
        d="M33.6 28.3c-.5-.25-2.98-1.47-3.44-1.64-.46-.17-.8-.25-1.13.25-.33.5-1.3 1.64-1.6 1.98-.29.33-.59.37-1.1.12-.5-.25-2.12-.78-4.04-2.5-1.5-1.33-2.5-2.98-2.8-3.48-.29-.5-.03-.77.22-1.02.23-.22.5-.58.75-.87.25-.29.33-.5.5-.83.17-.33.08-.62-.04-.87-.12-.25-1.13-2.72-1.55-3.72-.4-.98-.82-.85-1.13-.87h-.96c-.33 0-.87.12-1.33.62-.46.5-1.75 1.7-1.75 4.15s1.79 4.81 2.04 5.15c.25.33 3.52 5.37 8.52 7.53 1.19.51 2.12.82 2.84 1.05 1.2.38 2.28.33 3.14.2.96-.14 2.98-1.22 3.4-2.4.42-1.18.42-2.18.29-2.4-.12-.2-.46-.33-.96-.58z"
        fill="#fff"
      />
    </svg>
  )
}

function Tile({ item, top, label }: { item: Item; top: number; label: string }) {
  const { Icon, color, left, delay } = item
  return (
    <div className="rf-item" style={{ left, top, animationDelay: `${delay}s` }}>
      <div className="rf-box">
        {Icon ? <Icon size={26} color={color} aria-hidden /> : <WhatsAppMark />}
      </div>
      <div className="rf-label">{label}</div>
    </div>
  )
}

export function RequirementsFlow() {
  const t = useTranslations('builder')
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const stage = stageRef.current
    const svg = svgRef.current
    if (!wrap || !stage || !svg) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Hold the SMIL timeline until the stage is actually on screen.
    svg.pauseAnimations?.()

    const ro = new ResizeObserver(() => {
      const s = Math.min(1, wrap.clientWidth / 680)
      stage.style.transform = `scale(${s})`
      wrap.style.height = `${Math.round(258 * s)}px`
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        stage.classList.add('run')
        if (!reduced && svg.unpauseAnimations) {
          svg.setCurrentTime(0)
          svg.unpauseAnimations()
        }
        io.disconnect()
      },
      { threshold: 0.35 }
    )
    io.observe(wrap)

    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} dir="ltr" className="mx-auto w-full max-w-[680px]" style={{ height: 258 }}>
      <div ref={stageRef} className="rf-stage">
        <div className="rf-shift">
          <svg
            ref={svgRef}
            width={680}
            height={318}
            viewBox="0 0 680 318"
            className="absolute left-0 top-0"
            aria-hidden
          >
            <path
              id="rf-w1"
              className="rf-line"
              d="M0 131C16 121 28 117 41 119C58 121 64 135 78 135C92 135 100 119 115 119C132 119 138 135 152 135C166 135 174 119 189 119C206 119 212 135 226 135C240 135 248 119 263 119C280 119 286 135 300 135C314 135 322 119 337 119C352 119 362 126 370 132C378 138 381 144 386 150"
              fill="none"
              stroke="#B9C6D4"
              strokeWidth="1"
            />
            <path
              id="rf-w2"
              className="rf-line"
              d="M0 241C16 231 28 227 41 229C58 231 64 245 78 245C92 245 100 229 115 229C132 229 138 245 152 245C166 245 174 229 189 229C206 229 212 245 226 245C240 245 248 229 263 229C280 229 286 245 300 245C314 245 322 229 337 229C352 229 362 222 370 216C378 210 381 206 386 202"
              fill="none"
              stroke="#B9C6D4"
              strokeWidth="1"
            />
            <path id="rf-v1" className="rf-branch" d="M486 164C496 158 500 124 510 116" fill="none" stroke="#B9C6D4" strokeWidth="1" />
            <path id="rf-v2" className="rf-branch" d="M486 176L510 176" fill="none" stroke="#B9C6D4" strokeWidth="1" />
            <path id="rf-v3" className="rf-branch" d="M486 188C496 194 500 228 510 236" fill="none" stroke="#B9C6D4" strokeWidth="1" />

            {(
              [
                ['rf-w1', '2.8s', '1.8s', ORANGE, 3.5],
                ['rf-w1', '2.8s', '3.2s', ORANGE, 3.5],
                ['rf-w2', '2.8s', '2.3s', ORANGE, 3.5],
                ['rf-w2', '2.8s', '3.7s', ORANGE, 3.5],
                ['rf-v1', '1.8s', '2.8s', BLUE, 3],
                ['rf-v2', '1.8s', '3.2s', BLUE, 3],
                ['rf-v3', '1.8s', '3.6s', BLUE, 3],
              ] as const
            ).map(([path, dur, begin, color, r], i) => (
              <circle key={i} r={r} fill={color} opacity="0">
                <animateMotion dur={dur} begin={begin} repeatCount="indefinite">
                  <mpath href={`#${path}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  dur={dur}
                  begin={begin}
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.1;0.85;1"
                />
              </circle>
            ))}
          </svg>

          {ROW1.map((item) => (
            <Tile key={item.key} item={item} top={92} label={t(item.key)} />
          ))}
          {ROW2.map((item) => (
            <Tile key={item.key} item={item} top={202} label={t(item.key)} />
          ))}

          <div className="rf-hub">
            <Image src="/images/brand/logo-369ai.png" width={353} height={334} alt="369ai.Biz" className="h-11 w-auto" />
            <div className="mt-1.5 text-[11px] font-medium" style={{ color: ORANGE }}>
              {t('weBuildIt')}
            </div>
          </div>

          {OUTPUTS.map(({ key, Icon, color, top, delay }) => (
            <div key={key} className="rf-out" style={{ top, animationDelay: `${delay}s` }}>
              <Icon size={20} color={color} aria-hidden />
              <span className="text-[13px] text-ink-soft">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
