import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MapPin, Phone, Mail, MessageCircle, ScanLine } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { PageHero } from '@/components/ui/PageHero'
import { AddressQr } from '@/components/ui/AddressQr'
import { OFFICES, mapsUrl, telHref } from '@/content/offices'
import {
  readContact,
  telHref as salesTelHref,
  mailtoHref,
  waHref,
  waNumber,
} from '@/lib/contact-settings'
import { isUnlocked, sessionHours } from '@/lib/careers-auth'
import { UnlockDialog } from '@/components/careers/UnlockDialog'
import { EnquiryForm } from '@/components/contact/EnquiryForm'
import { ContactSettings } from '@/components/contact/ContactSettings'
import { locales, localeLabels } from '@/i18n/routing'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return {
    title: t('eyebrow'),
    description: t('body').slice(0, 155),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].hreflang, `/${l}/contact`])
      ),
    },
  }
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  /** ?manage=1 reveals the owner controls — same switch as /careers. */
  searchParams: Promise<{ manage?: string }>
}) {
  const { locale } = await params
  const { manage } = await searchParams

  // ?manage=0 is the instant lock. Deleting the session cookie is not
  // allowed during a page render, so hand off to the route handler that
  // clears it and sends the visitor back here without the parameter.
  if (manage === '0') {
    redirect(`/api/manage/lock?next=${encodeURIComponent(`/${locale}/contact`)}`)
  }
  setRequestLocale(locale)

  const t = await getTranslations('contact')
  const tAssistant = await getTranslations('assistant')

  const tEnq = await getTranslations('contact.enquiry')
  const settings = await readContact()
  // Both halves, exactly as /careers does it: the session alone does not
  // clutter the page for a visitor, and ?manage=1 alone proves nothing.
  const unlocked = await isUnlocked()
  const managing = manage === '1'
  const canManage = unlocked && managing
  const hours = await sessionHours()

  /* tel: and mailto: are what hand the visitor to the dialer and the mail
     app; the hrefs are derived from the stored text so an edited number with
     spaces in it can never produce a dead link. The mail one carries a
     subject so the draft does not open blank. */
  const directLinks = [
    {
      Icon: Phone,
      label: settings.phoneDisplay,
      href: salesTelHref(settings.phoneDisplay),
      aria: `${t('callAria')} ${settings.phoneDisplay}`,
    },
    {
      Icon: Mail,
      label: settings.email,
      href: mailtoHref(settings.email, tEnq('mailSubject')),
      aria: `${t('emailAria')} ${settings.email}`,
    },
    {
      Icon: MessageCircle,
      label: tAssistant('whatsapp'),
      href: waHref(settings.phoneDisplay),
      external: true,
      aria: tAssistant('whatsapp'),
    },
  ]

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* Reach us directly */}
      <Section size="sm">
        <ul className="grid gap-4 sm:grid-cols-3">
          {directLinks.map(({ Icon, label, href, external, aria }, i) => (
            <Reveal as="li" key={href} delay={i * 70}>
              <a
                href={href}
                aria-label={aria}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="card-glow flex h-full items-center gap-4 rounded-panel border border-surface-line bg-white p-6 transition-colors hover:border-brand-400"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-medium text-ink">{label}</span>
              </a>
            </Reveal>
          ))}
        </ul>

        {/* The editor sits with the cards it edits. It used to render under the
            enquiry form, a screen further down, where someone looking at the
            number had no way to tell it was editable at all. */}
        {canManage ? (
          <div className="mt-6">
            <ContactSettings settings={settings} />
          </div>
        ) : null}
      </Section>

      {/* The enquiry form. Nothing is posted to us: the answers are composed
          into a WhatsApp message and the visitor is handed to WhatsApp with it
          already written, the Global Seas Trust pattern. */}
      <Section>
        <SectionHeader title={tEnq('title')} body={tEnq('body')} />
        <EnquiryForm number={waNumber(settings.phoneDisplay)} />
      </Section>

      {managing && !unlocked ? <UnlockDialog hours={hours} /> : null}

      {/* Offices — each with a QR code that opens it in Google Maps */}
      <Section tone="alt">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('officesTitle')}
          body={t('officesBody')}
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICES.map((office, i) => {
            const href = mapsUrl(office.mapsQuery)
            const label = `369AI ${office.country} — ${office.city}`

            return (
              <Reveal as="li" key={office.id} delay={i * 60}>
                <article className="card-glow flex h-full flex-col rounded-panel border border-surface-line bg-white p-7">
                  <h3 className="text-lg font-semibold">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors hover:text-brand-600"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                      {office.country} — {office.city}
                    </a>
                  </h3>

                  <address className="mt-3 text-sm not-italic leading-relaxed text-slate-muted">
                    {office.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>

                  {office.phones?.map((phone) => (
                    <a
                      key={phone}
                      href={telHref(phone)}
                      className="mt-2 block text-sm font-medium text-brand-600 transition-colors hover:text-brand-800"
                    >
                      {phone}
                    </a>
                  ))}

                  {/* mt-auto keeps every QR aligned along the bottom of the row */}
                  <div className="mt-auto flex items-center gap-4 pt-6">
                    <AddressQr url={href} title={label} />
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-faint">
                      <ScanLine className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                      {t('scanForAddress')}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
