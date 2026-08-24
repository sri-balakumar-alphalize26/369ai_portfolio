import { cn } from '@/lib/cn'

type SectionProps = {
  children: React.ReactNode
  /** Alternating band colour — keeps the page rhythm legible without borders. */
  tone?: 'white' | 'alt' | 'dark' | 'brand'
  className?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
}

const TONES = {
  white: 'bg-white',
  alt: 'bg-surface-alt',
  dark: 'bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-brand-100',
  brand: 'bg-gradient-to-br from-brand-700 to-brand-500 text-white',
} as const

const SIZES = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-24',
  lg: 'py-20 sm:py-32',
} as const

export function Section({ children, tone = 'white', size = 'md', className, id }: SectionProps) {
  return (
    <section id={id} className={cn(TONES[tone], SIZES[size], className)}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">{children}</div>
    </section>
  )
}

/** Eyebrow + heading + lead paragraph, centred or left aligned. */
export function SectionHeader({
  eyebrow,
  title,
  body,
  align = 'center',
  tone = 'light',
  rule = false,
}: {
  eyebrow?: string
  title: React.ReactNode
  body?: string
  align?: 'center' | 'start'
  tone?: 'light' | 'dark'
  /** Hairline drawing out from the eyebrow (the About-block treatment). */
  rule?: boolean
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-start'
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-3 text-sm font-semibold uppercase tracking-[0.14em]',
            rule && 'eyebrow-rule',
            tone === 'dark' ? 'text-brand-300' : 'text-brand-600'
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-3xl font-bold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]',
          tone === 'dark' && 'text-white'
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            'mt-5 text-lg leading-relaxed',
            tone === 'dark' ? 'text-slate-300' : 'text-slate-muted'
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  )
}
