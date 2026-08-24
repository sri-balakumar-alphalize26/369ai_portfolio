'use client'

import { useTranslations } from 'next-intl'
import { LogoLoader } from '@/components/ui/LogoLoader'

/**
 * Route loading state — Next.js shows this automatically while a page's
 * server payload streams in during navigation.
 *
 * The indicator is the water-fill logo loader (owner replaced the round
 * spinner site-wide). min-h keeps the footer from jumping up while the
 * page body is pending.
 *
 * Client component so the aria-label can come from the message catalog —
 * it renders inside the layout's NextIntlClientProvider.
 */
export default function Loading() {
  const t = useTranslations('common')
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center pt-24"
      role="status"
      aria-label={t('loading')}
    >
      <LogoLoader />
    </div>
  )
}
