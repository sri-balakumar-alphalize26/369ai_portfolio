/**
 * Compact hero for inner pages — same brand field as the homepage hero,
 * but shorter so the page's real content starts sooner.
 */
export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string
  title: string
  body?: string
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="aurora-blob aurora-a h-[26rem] w-[26rem] opacity-45"
          style={{ top: '-9rem', insetInlineStart: '-5rem', background: '#0078a8' }}
        />
        <div
          className="aurora-blob aurora-b h-[22rem] w-[22rem] opacity-35"
          style={{ top: '-4rem', insetInlineEnd: '-4rem', background: '#30a8c0' }}
        />
        <div
          className="aurora-blob aurora-c h-[16rem] w-[16rem] opacity-20"
          style={{ bottom: '-6rem', insetInlineStart: '42%', background: '#ff7800' }}
        />
      </div>
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-40">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p
              className="mb-4 inline-flex rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 backdrop-blur"
              style={{ animation: 'word-rise 0.6s var(--ease-out-soft) both' }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl"
            style={{ animation: 'word-rise 0.7s var(--ease-out-soft) 0.08s both' }}
          >
            {title}
          </h1>
          {body ? (
            <p
              className="mt-5 text-lg leading-relaxed text-brand-100"
              style={{ animation: 'word-rise 0.8s var(--ease-out-soft) 0.18s both' }}
            >
              {body}
            </p>
          ) : null}
        </div>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-8 w-full sm:h-14"
      >
        <path d="M0,60 C360,6 1080,6 1440,60 L1440,60 L0,60 Z" fill="var(--color-surface)" />
      </svg>
    </section>
  )
}
