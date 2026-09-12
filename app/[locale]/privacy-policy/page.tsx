import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Clock, Mail, Phone } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { PageHero } from '@/components/ui/PageHero'
import { readContact, mailtoHref, telHref } from '@/lib/contact-settings'
import { locales, localeLabels, type Locale } from '@/i18n/routing'

/**
 * The date the policy last changed. One constant rendered in every locale — the
 * alternative is the same date hand-copied into nine catalogs, where the first
 * edit that misses one leaves a locale quietly claiming the wrong date.
 *
 * Written out as "2 September 2026", with the month named rather than numbered:
 * `02 09 2026` reads as 2 September to most of the world and as 9 February in
 * the US, and a policy date is not worth that ambiguity.
 */
const UPDATED = new Date('2026-09-02T00:00:00Z')
const UPDATED_ISO = UPDATED.toISOString().slice(0, 10)

/**
 * Two locales need a tag other than their hreflang.
 *
 * `en` renders as "September 2, 2026" — Intl reads plain `en` as US ordering,
 * and the day-first form is what the site uses. `ar` defaults to Arabic-Indic
 * numerals, while the rest of the Arabic copy is written with Western ones, so
 * the numbering system is pinned to match. Every other locale formats correctly
 * from its own hreflang, including Bengali, whose own digits the bn copy
 * already uses elsewhere.
 */
const DATE_TAG: Partial<Record<Locale, string>> = { en: 'en-GB', ar: 'ar-u-nu-latn' }

function formatUpdated(locale: Locale) {
  const tag = DATE_TAG[locale] ?? localeLabels[locale].hreflang
  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(UPDATED)
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: t('title'),
    description: t('lead').slice(0, 155),
    alternates: {
      canonical: `/${locale}/privacy-policy`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [localeLabels[l].hreflang, `/${l}/privacy-policy`])
        ),
        // Anyone matching none of the nine lands on English.
        'x-default': `/en/privacy-policy`,
      },
    },
  }
}

/** A bulleted list. `ps-5` rather than `pl-5` so Arabic indents on the right. */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 ps-5 marker:text-brand-400">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

/** A titled block inside a clause — used for the parts of "What we collect". */
function SubClause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('privacy')
  const contact = await readContact()

  /**
   * The clauses in order. Numbering is rendered from this array rather than
   * written into the copy, so a section can be added or moved without editing
   * the number out of nine translated headings.
   */
  const clauses: { id: string; children: React.ReactNode }[] = [
    { id: 'who', children: <p>{t('who.body')}</p> },
    { id: 'scope', children: <p>{t('scope.body')}</p> },
    {
      id: 'collect',
      children: (
        <>
          <p>{t('collect.lead')}</p>
          <SubClause title={t('collect.apps.title')}>
            <p>{t('collect.apps.body')}</p>
            <Bullets
              items={[
                t('collect.apps.i1'),
                t('collect.apps.i2'),
                t('collect.apps.i3'),
                t('collect.apps.i4'),
                t('collect.apps.i5'),
              ]}
            />
          </SubClause>
          <SubClause title={t('collect.enquiries.title')}>
            <p>{t('collect.enquiries.body')}</p>
          </SubClause>
          <SubClause title={t('collect.reviews.title')}>
            <p>{t('collect.reviews.body')}</p>
          </SubClause>
          <SubClause title={t('collect.cookies.title')}>
            <p>{t('collect.cookies.body')}</p>
          </SubClause>
          <SubClause title={t('collect.storage.title')}>
            <p>{t('collect.storage.body')}</p>
          </SubClause>
          <SubClause title={t('collect.technical.title')}>
            <p>{t('collect.technical.body')}</p>
          </SubClause>
          <SubClause title={t('collect.none.title')}>
            <p>{t('collect.none.body')}</p>
          </SubClause>
        </>
      ),
    },
    {
      id: 'use',
      children: (
        <>
          <p>{t('use.lead')}</p>
          <Bullets items={[t('use.u1'), t('use.u2'), t('use.u3'), t('use.u4')]} />
        </>
      ),
    },
    {
      id: 'basis',
      children: (
        <>
          <p>{t('basis.body')}</p>
          <p className="mt-4">{t('basis.withdraw')}</p>
        </>
      ),
    },
    { id: 'whatsapp', children: <p>{t('whatsapp.body')}</p> },
    {
      id: 'thirdParty',
      children: (
        <>
          <p>{t('thirdParty.lead')}</p>
          <Bullets
            items={[
              t('thirdParty.t1'),
              t('thirdParty.t2'),
              t('thirdParty.t3'),
              t('thirdParty.t4'),
            ]}
          />
        </>
      ),
    },
    { id: 'sharing', children: <p>{t('sharing.body')}</p> },
    { id: 'transfers', children: <p>{t('transfers.body')}</p> },
    {
      id: 'security',
      children: (
        <>
          <p>{t('security.lead')}</p>
          <Bullets
            items={[t('security.s1'), t('security.s2'), t('security.s3'), t('security.s4')]}
          />
        </>
      ),
    },
    {
      id: 'retention',
      children: (
        <>
          <p>{t('retention.body')}</p>
          <Bullets items={[t('retention.r1'), t('retention.r2'), t('retention.r3')]} />
        </>
      ),
    },
    {
      id: 'rights',
      children: (
        <>
          <p>{t('rights.lead')}</p>
          <Bullets
            items={[
              t('rights.r1'),
              t('rights.r2'),
              t('rights.r3'),
              t('rights.r4'),
              t('rights.r5'),
              t('rights.r6'),
            ]}
          />
          <p className="mt-4">{t('rights.how')}</p>
        </>
      ),
    },
    { id: 'children', children: <p>{t('children.body')}</p> },
    { id: 'changes', children: <p>{t('changes.body')}</p> },
    {
      id: 'contact',
      children: (
        <>
          <p>{t('contact.body', { email: contact.email, phone: contact.phoneDisplay })}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={mailtoHref(contact.email, t('title'))}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {contact.email}
            </a>
            <a
              href={telHref(contact.phoneDisplay)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {contact.phoneDisplay}
            </a>
          </div>
        </>
      ),
    },
  ]

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('lead')} />

      <Section>
        <div className="mx-auto max-w-3xl">
          {/* Two-tone pill: label panel, then the date, with the brand orange
              down the leading edge. `border-s` rather than border-left so the
              bar moves to the right in Arabic. It wraps rather than nowrapping
              as one line — "Last updated" is long in Tamil and German, and the
              two halves together overrun a 390px phone; wrapping stacks them
              instead of pushing the pill off the page. */}
          <span className="inline-flex max-w-full flex-wrap items-stretch overflow-hidden rounded-[10px] border border-s-[3px] border-surface-line border-s-accent-500 bg-white align-middle">
            <span className="inline-flex items-center gap-[7px] whitespace-nowrap bg-surface-alt px-3.5 py-2.5 text-[13px] font-bold text-ink">
              <Clock className="h-[15px] w-[15px] shrink-0 text-accent-600" aria-hidden />
              {t('updatedLabel')}
            </span>
            <span className="inline-flex items-center whitespace-nowrap px-4 py-2.5 text-[13.5px] tabular-nums text-slate-body">
              <time dateTime={UPDATED_ISO}>{formatUpdated(locale as Locale)}</time>
            </span>
          </span>

          <div className="mt-10 space-y-12 text-[1.05rem] leading-relaxed text-slate-body">
            {clauses.map((clause, i) => (
              <section key={clause.id} id={clause.id} className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                  <span className="me-2 text-brand-500 tabular-nums">{i + 1}.</span>
                  {t(`${clause.id}.title`)}
                </h2>
                <div className="mt-3">{clause.children}</div>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
