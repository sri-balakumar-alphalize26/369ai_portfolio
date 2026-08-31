'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, FileText, X } from 'lucide-react'
import { AppIcon, type AppIconData } from '@/components/apps/AppIcon'
import { ButtonLink } from '@/components/ui/Button'
import { useIdlePromo } from '@/lib/use-idle-promo'

/**
 * The idle advertisement — one native <dialog>, opened when the visitor has
 * gone still on one of the four pages in content/promo.ts. showModal() gives
 * focus trapping, Escape and the backdrop for free, and globals.css styles
 * `dialog[open]` and `dialog::backdrop` by element selector, so the entrance
 * animation and its reduced-motion opt-out come with it — no new CSS.
 *
 * Focus lands on the close button rather than the call to action: this
 * appeared without being asked for, so a keyboard visitor must arrive at the
 * way out, never be aimed at the advert.
 *
 * Dismissing mutes it for a day; following the link ends it for good. Both
 * funnel through the platform `close` event, which is the only place state
 * goes back to the hook.
 */
export function IdlePromo({ app }: { app: (AppIconData & { id: string }) | null }) {
  const { kind, open, dismiss, convert } = useIdlePromo()
  const t = useTranslations('promo')
  const tSolutions = useTranslations('solutions')
  const tFooter = useTranslations('footer')
  const locale = useLocale()
  const ref = useRef<HTMLDialogElement>(null)
  const converted = useRef(false)

  if (!open || !kind) return null

  const href =
    kind === 'brochure' ? '/docs/369ai-brochure.pdf' : `/${locale}/${kind === 'apps' ? 'apps' : 'solutions'}`

  // Either button means they engaged, so the ad retires for good rather than
  // for a day. Recorded before the navigation, and flagged so the dialog's
  // own close event does not downgrade it to a dismissal.
  function follow() {
    converted.current = true
    convert()
  }

  function mount(node: HTMLDialogElement | null) {
    ref.current = node
    if (!node || node.open) return
    node.showModal()
    node.addEventListener(
      'close',
      () => {
        // Following the link already recorded the stronger answer; a dismissal
        // written after it would downgrade "never" to a single day.
        if (!converted.current) dismiss()
      },
      { once: true }
    )
  }

  return (
    <dialog
      ref={mount}
      aria-labelledby="promo-title"
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      className="w-[min(26rem,calc(100vw-2rem))] rounded-panel border border-surface-line bg-white p-0 text-ink backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative max-h-[85vh] overflow-y-auto p-6 sm:p-7">
        {/* First in the DOM so showModal() focuses it. */}
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label={t('close')}
          className="absolute end-3 top-3 rounded-lg p-1.5 text-slate-faint transition-colors hover:bg-surface-alt hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.11em] text-slate-faint">
          {t('label')}
        </p>

        {kind === 'apps' && app ? (
          <AppIcon app={app} className="mt-4 h-11" />
        ) : null}

        {kind === 'solutions' ? (
          <Image
            src="/images/solutions/erp.jpg"
            alt=""
            width={448}
            height={220}
            className="mt-4 h-32 w-full rounded-card object-cover"
          />
        ) : null}

        {kind === 'brochure' ? (
          <span className="mt-4 inline-flex items-center gap-2 rounded-pill bg-surface-alt px-3 py-1.5 text-xs font-semibold text-slate-muted">
            <FileText className="h-3.5 w-3.5 text-brand-500" strokeWidth={1.8} aria-hidden />
            {tSolutions('brochureMeta')}
          </span>
        ) : null}

        <h2 id="promo-title" className="mt-4 text-xl font-bold leading-snug text-ink">
          {t(`${kind}.title`)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-body">{t(`${kind}.body`)}</p>

        <ButtonLink
          href={href}
          variant="accent"
          size="md"
          className="mt-6 w-full"
          {...(kind === 'brochure' ? { target: '_blank', rel: 'noopener' } : {})}
          onClick={follow}
        >
          {t(`${kind}.cta`)}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </ButtonLink>

        {/* The way to reach us, rather than making them go and find it. The
            contact form collects the details before handing off to WhatsApp,
            so an enquiry survives even if the chat is never sent. */}
        <ButtonLink
          href={`/${locale}/contact`}
          variant="outline"
          size="md"
          className="mt-2 w-full"
          onClick={follow}
        >
          {tFooter('contactUs')}
        </ButtonLink>
      </div>
    </dialog>
  )
}
