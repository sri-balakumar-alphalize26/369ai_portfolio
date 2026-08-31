/**
 * A labelled row of brand marks — used twice in the footer: the social
 * accounts and the AI assistants. One component rather than two near-copies,
 * because they are the same object.
 *
 * The reveal is not here. Both rows share one observer in FooterSocial.tsx so
 * they read as a single arrival; `delay` is where this row starts on that
 * shared timeline, and each mark steps ICON_STEP past it. The stagger rides an
 * inline --d rather than nth-child rules, so a fifth account or a seventh
 * assistant needs no new CSS.
 *
 * Marks are inlined rather than <img>: they are static strings we own, and an
 * <img> per brand would leak every visitor's IP to third-party origins just to
 * draw a logo.
 *
 * The assistants name themselves visually through `data-name`; the social
 * marks answer with their own brand colour instead and so need no tooltip.
 * Either way the name is on the link as `aria-label`, announced once.
 */
export const ICON_STEP = 70

export function IconRow({
  label,
  items,
  variant,
  delay,
}: {
  label: string
  items: { name: string; href: string; svg: string; color?: string }[]
  variant: 'social' | 'ai'
  delay: number
}) {
  const ai = variant === 'ai'

  return (
    <div className="mt-6">
      <p className={`fsoc__kicker fsoc__kicker--${ai ? '2' : '1'}`}>{label}</p>
      <ul className={`fsoc__row fsoc__row--${variant}`}>
        {items.map(({ name, href, svg, color }, index) => (
          <li key={name}>
            <a
              className={ai ? 'fsoc__ic fsoc__ic--ai' : 'fsoc__ic'}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-name={ai ? name : undefined}
              aria-label={name}
              style={
                {
                  '--d': `${delay + index * ICON_STEP}ms`,
                  ...(color ? { '--c': color } : {}),
                } as React.CSSProperties
              }
            >
              <span aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
