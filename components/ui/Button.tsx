import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'onDark'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  // Corporate blue — the default action.
  primary:
    'bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow-lg shadow-cyan-900/20 hover:scale-[1.03] active:scale-100',
  // Warm accent — reserved for the single most important CTA on a screen.
  accent:
    'bg-gradient-to-r from-accent-500 to-accent-400 text-white font-semibold shadow-lg shadow-orange-500/25 hover:scale-[1.03] active:scale-100',
  outline:
    'border border-surface-line bg-white text-ink hover:border-brand-400 hover:text-brand-600',
  ghost: 'text-brand-600 hover:bg-brand-50',
  onDark: 'bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap'

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.ComponentProps<typeof Link>,
    'href' | 'className' | 'children'
  >) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </Link>
  )
}
