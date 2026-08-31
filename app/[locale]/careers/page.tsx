import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Boxes, HeartHandshake, Globe2, GraduationCap } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { PageHero } from '@/components/ui/PageHero'
import { RevealGroup } from '@/components/ui/RevealGroup'
import { Magnetic } from '@/components/ui/Magnetic'
import { ButtonLink } from '@/components/ui/Button'
import { CareersBoard } from '@/components/careers/CareersBoard'
import { UnlockDialog } from '@/components/careers/UnlockDialog'
import { readCareers, type Role } from '@/lib/careers'
import { isUnlocked, sessionHours } from '@/lib/careers-auth'
import { locales, localeLabels } from '@/i18n/routing'

/** "Why work here" — four cards, the About "Everything you need" treatment. */
const WHY = [
  { key: 'w1', Icon: Boxes },
  { key: 'w2', Icon: GraduationCap },
  { key: 'w3', Icon: Globe2 },
  { key: 'w4', Icon: HeartHandshake },
] as const

const SITE = 'https://369ai.biz'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'careers' })
  return {
    title: t('title'),
    description: t('body').slice(0, 155),
    alternates: {
      canonical: `/${locale}/careers`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/careers`])
      ),
    },
  }
}

/**
 * JobPosting structured data — what Google Jobs actually reads. The visible
 * description lives in the (closed, but rendered) dialog; this is the machine
 * copy, so a listing can surface in the jobs box rather than only on our page.
 */
function jobPosting(role: Role, locale: string) {
  const list = (title: string, items?: string[]) =>
    items?.length ? `<h3>${title}</h3><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''

  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: role.title,
    description: [
      role.summary ? `<p>${role.summary.replace(/\*\*/g, '')}</p>` : '',
      list('Roles &amp; Responsibilities', role.responsibilities),
      list('Required Skills', role.requirements),
      list('Eligibility', role.eligibility),
    ].join(''),
    datePosted: role.postedAt,
    identifier: { '@type': 'PropertyValue', name: '369AI', value: role.id },
    hiringOrganization: {
      '@type': 'Organization',
      name: '369AI',
      sameAs: SITE,
      logo: `${SITE}/images/brand/logo-369ai.png`,
    },
    employmentType: role.jobType?.toUpperCase().replace(/[^A-Z]+/g, '_'),
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: role.location, addressCountry: 'IN' },
    },
    url: `${SITE}/${locale}/careers`,
    directApply: true,
  }
}

export default async function CareersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ manage?: string }>
}) {
  const { locale } = await params
  const { manage } = await searchParams

  // ?manage=0 is the instant lock. Deleting the session cookie is not
  // allowed during a page render, so hand off to the route handler that
  // clears it and sends the visitor back here without the parameter.
  if (manage === '0') {
    redirect(`/api/manage/lock?next=${encodeURIComponent(`/${locale}/careers`)}`)
  }
  setRequestLocale(locale)

  const t = await getTranslations('careers')
  const tc = await getTranslations('common')
  const base = `/${locale}`

  // Read per request: a role opened or closed shows up without a rebuild.
  const { roles, whatsapp } = await readCareers()
  // Two separate ideas, deliberately: a valid session saves re-typing the
  // passcode, but nothing is editable unless the URL asks for it. A plain
  // /careers is a visitor page even while unlocked.
  const unlocked = await isUnlocked()
  const managing = manage === '1'
  const canEdit = unlocked && managing
  const hours = await sessionHours()
  const listed = roles.filter((role) => role.active)

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {listed.map((role) => (
        <script
          key={role.id}
          type="application/ld+json"
          // Server-rendered from our own data; nothing here is user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting(role, locale)) }}
        />
      ))}

      <Section>
        <SectionHeader title={t('whyTitle')} body={t('whyBody')} />
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(({ key, Icon }, i) => (
            <li
              key={key}
              className="flood-card"
              style={{ '--d': `${i * 100}ms` } as React.CSSProperties}
            >
              <article className="card-glow h-full rounded-panel border border-surface-line bg-white p-7">
                <span className="icon-tile flex h-11 w-11 items-center justify-center rounded-card">
                  <span className="flood" aria-hidden />
                  <Icon className="relative h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t(`why.${key}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-muted">
                  {t(`why.${key}.body`)}
                </p>
              </article>
            </li>
          ))}
        </RevealGroup>
      </Section>

      <Section tone="alt">
        <SectionHeader title={t('rolesTitle')} body={t('rolesBody')} />
        <CareersBoard
          roles={roles}
          whatsapp={whatsapp}
          canEdit={canEdit}
          base={base}
          sessionHours={hours}
        />
      </Section>

      <Section tone="dark" size="sm">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('ctaTitle')}</h2>
            <p className="mt-3 text-brand-100">{t('ctaBody')}</p>
          </div>
          <Magnetic>
            <ButtonLink href={`${base}/contact`} variant="accent" size="lg">
              {tc('talkToSales')}
            </ButtonLink>
          </Magnetic>
        </div>
      </Section>

      {/* The only way in, and only when there is no session yet. */}
      {managing && !unlocked ? <UnlockDialog hours={hours} /> : null}
    </>
  )
}
