import { TECH_ROWS, type Tech } from '@/content/technologies'
import { MarqueeInView } from '@/components/ui/MarqueeInView'

/**
 * "Technologies We Work With" — three stacked rows scrolling in alternating
 * directions (the microgenn.com pattern). Pure CSS: each row renders its items
 * three times so translateX(-66.666%) lands exactly on a seam and the loop is
 * invisible. Pauses on hover, reverses under RTL. See globals.css.
 */
export function TechMarquee() {
  return (
    <MarqueeInView className="relative space-y-4">
      {TECH_ROWS.map((row, i) => (
        <MarqueeRow
          key={i}
          items={row}
          reverse={i % 2 === 1}
          // Slightly different speeds stop the rows marching in lockstep.
          duration={26 + i * 4}
        />
      ))}

      {/* Edge fade lives on .marquee-viewport as a mask now. */}
    </MarqueeInView>
  )
}

function MarqueeRow({
  items,
  reverse,
  duration,
}: {
  items: Tech[]
  reverse: boolean
  duration: number
}) {
  return (
    <div className="marquee-viewport overflow-hidden">
      <div
        className="marquee-track"
        data-direction={reverse ? 'reverse' : 'forward'}
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {/* Tripled so the loop point is seamless; copies 2-3 are hidden from
            screen readers so nothing announces three times. */}
        {items.map((tech) => (
          <TechChip key={tech.name} tech={tech} />
        ))}
        {[1, 2].map((copy) => (
          <div key={copy} aria-hidden className="contents">
            {items.map((tech) => (
              <TechChip key={`${tech.name}-${copy}`} tech={tech} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function TechChip({ tech }: { tech: Tech }) {
  return (
    <div
      className="mx-2 flex shrink-0 items-center gap-2.5 rounded-pill border border-surface-line bg-white px-5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-transform duration-300 hover:scale-105"
      aria-hidden={false}
    >
      {tech.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tech.logo} alt="" className="h-6 w-6 object-contain" loading="lazy" />
      ) : (
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-400" />
      )}
      <span className="whitespace-nowrap text-sm font-medium text-slate-body">
        {tech.name}
      </span>
    </div>
  )
}
