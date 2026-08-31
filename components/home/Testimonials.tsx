'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Lock, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { MarqueeInView } from '@/components/ui/MarqueeInView'
import { initials, type Testimonial } from '@/content/testimonials'
import { deleteTestimonial, toggleTestimonial } from '@/lib/testimonials-actions'
import { lockCareers } from '@/app/[locale]/careers/actions'
import { ReviewDialog } from './ReviewDialog'
import { TestimonialEditor } from './TestimonialEditor'

/**
 * What clients say — two rows drifting in opposite directions, the same
 * marquee mechanic as the leadership video rail (hover pauses, the track is
 * tripled so the -66.666% loop is seamless, and it only animates in view).
 *
 * In manage mode the rows become a plain grid: a moving target is no way to
 * hit a Delete button, and the owner is reading rather than being charmed.
 *
 * `canEdit` only decides what renders — every action re-checks the passcode
 * session on the server before writing.
 */
export function Testimonials({
  entries,
  canEdit = false,
  openReview = false,
  reviewName = '',
  reviewProduct = '',
}: {
  entries: Testimonial[]
  canEdit?: boolean
  /** ?review=1 — so a WhatsApp message can carry the form itself. */
  openReview?: boolean
  reviewName?: string
  reviewProduct?: string
}) {
  const t = useTranslations('home')
  const [reviewing, setReviewing] = useState(openReview)
  const [editor, setEditor] = useState<{ entry: Testimonial | null } | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const [query, setQuery] = useState('')

  const base = canEdit ? entries : entries.filter((entry) => entry.active !== false)

  /* Manage-mode search. Client-side over the already-loaded list, so it filters
     as you type with no round trip. It matches the TRANSLATED product label as
     well as the raw fields, so typing "ERP" or "Hardware" finds those reviews
     rather than only matching the internal key. */
  const q = canEdit ? query.trim().toLowerCase() : ''
  const shown = !q
    ? base
    : base.filter((entry) =>
        [
          entry.name,
          entry.role,
          entry.company,
          entry.quote,
          t(`products.${entry.product}`),
          String(entry.rating),
        ].some(
          (value) => String(value ?? '').toLowerCase().includes(q)
        )
      )

  return (
    <>
      {canEdit ? (
        <>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search
              className="pointer-events-none absolute inset-inline-start-0 top-1/2 ms-3.5 h-4 w-4 -translate-y-1/2 text-slate-faint"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('reviewSearchPh')}
              aria-label={t('reviewSearchPh')}
              className="h-11 w-full rounded-xl border border-surface-line bg-white ps-10 pe-10 text-[0.95rem] outline-none transition-colors focus:border-brand-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('reviewSearchClear')}
                className="absolute inset-inline-end-0 top-1/2 me-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-brand-50 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="text-sm text-slate-muted">
            {t('reviewSearchCount', { shown: shown.length, total: base.length })}
          </p>
          {/* Ends the session for every page at once, not just this one —
              same action the careers board uses. */}
          <button
            type="button"
            onClick={() => startTransition(() => void lockCareers())}
            className="ms-auto inline-flex h-9 items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400"
          >
            <Lock className="h-4 w-4" aria-hidden />
            Lock
          </button>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-panel border border-dashed border-surface-line p-8 text-center text-sm text-slate-muted">
            {t('reviewSearchEmpty')}
          </p>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((entry) => (
            <Card key={entry.id} entry={entry} canEdit>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-surface-line pt-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={entry.active !== false}
                  aria-label={`${entry.name} — show on the site`}
                  disabled={pending}
                  onClick={() => startTransition(() => void toggleTestimonial(entry.id))}
                  className={`role-switch ${entry.active !== false ? 'is-on' : ''}`}
                >
                  <span className="role-switch__dot" aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={() => setEditor({ entry })}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-surface-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brand-400 hover:text-brand-700"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </button>

                {confirming === entry.id ? (
                  <span className="ms-auto flex items-center gap-2 text-xs">
                    <span className="text-slate-muted">Delete?</span>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setConfirming(null)
                        startTransition(() => void deleteTestimonial(entry.id))
                      }}
                      className="rounded-pill bg-red-600 px-3 py-1.5 font-semibold text-white"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="rounded-pill border border-surface-line px-3 py-1.5 font-medium"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(entry.id)}
                    className="ms-auto inline-flex items-center gap-1.5 rounded-pill border border-surface-line px-3 py-1.5 text-xs font-medium text-slate-muted transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={() => setEditor({ entry: null })}
            className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed border-brand-200 bg-white/60 text-brand-600 transition-colors hover:border-brand-400 hover:bg-white"
          >
            <Plus className="h-7 w-7" aria-hidden />
            <span className="text-sm font-semibold">Add review</span>
          </button>
        </div>
        </>
      ) : shown.length ? (
        <Rails entries={shown} />
      ) : null}

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-muted">{t('reviewLead')}</p>
        <button
          type="button"
          onClick={() => setReviewing(true)}
          className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-surface-line bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <Star className="h-4 w-4 text-accent-500" aria-hidden />
          {t('reviewCta')}
        </button>
      </div>

      {reviewing ? (
        <ReviewDialog
          onClose={() => setReviewing(false)}
          defaultName={reviewName}
          defaultProduct={reviewProduct}
        />
      ) : null}
      {editor ? (
        <TestimonialEditor entry={editor.entry} onClose={() => setEditor(null)} />
      ) : null}
    </>
  )
}

/** The visitor's view: two rows, opposite directions, tripled for a seamless loop. */
function Rails({ entries }: { entries: Testimonial[] }) {
  const half = Math.ceil(entries.length / 2)
  const rows = [entries.slice(0, half), entries.slice(half)].filter((row) => row.length)

  return (
    <MarqueeInView className="relative space-y-5">
      {rows.map((row, index) => (
        <div key={index} className="marquee-viewport overflow-hidden py-2">
          <div
            className="marquee-track items-stretch"
            data-direction={index % 2 ? 'reverse' : undefined}
            style={{ ['--marquee-duration' as string]: index % 2 ? '75s' : '65s' }}
          >
            {row.map((entry) => (
              <Card key={entry.id} entry={entry} />
            ))}
            {[1, 2].map((copy) => (
              <div key={copy} aria-hidden className="contents">
                {row.map((entry) => (
                  <Card key={`${entry.id}-${copy}`} entry={entry} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </MarqueeInView>
  )
}

function Card({
  entry,
  canEdit = false,
  children,
}: {
  entry: Testimonial
  canEdit?: boolean
  children?: React.ReactNode
}) {
  const hidden = entry.active === false

  return (
    <article
      className={`card-glow flex flex-col rounded-panel border border-surface-line bg-white p-6 ${
        canEdit ? '' : 'mx-2.5 w-[19rem] shrink-0 sm:w-[22rem]'
      } ${hidden || entry.sample ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-500 text-sm font-bold text-white">
          {initials(entry.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{entry.name}</p>
          <div className="mt-0.5 flex gap-0.5 text-accent-500" aria-label={`${entry.rating} / 5`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className="h-3.5 w-3.5"
                fill={value <= entry.rating ? 'currentColor' : 'none'}
                strokeWidth={1.5}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {entry.role || entry.company ? (
          <p className="text-xs text-slate-faint">
            {[entry.role, entry.company].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {canEdit && hidden ? (
          <span className="rounded-pill bg-slate-200 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Not shown
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-body">{entry.quote}</p>

      {entry.sample ? (
        <p className="mt-4 rounded-lg bg-surface-alt px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-faint">
          Layout sample · not shown live
        </p>
      ) : null}

      {children}
    </article>
  )
}
