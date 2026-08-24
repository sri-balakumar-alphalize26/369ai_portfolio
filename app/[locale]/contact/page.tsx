import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MapPin, Phone, Mail, MessageCircle, ScanLine } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { PageHero } from '@/components/ui/PageHero'
import { AddressQr } from '@/components/ui/AddressQr'
import { OFFICES, CONTACT, mapsUrl, telHref } from '@/content/offices'
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
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('contact')
  const tAssistant = await getTranslations('assistant')

  const directLinks = [
    { Icon: Phone, label: CONTACT.phoneDisplay, href: `tel:${CONTACT.phone}` },
    { Icon: Mail, label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    {
      Icon: MessageCircle,
      label: tAssistant('whatsapp'),
      href: `https://wa.me/${CONTACT.whatsapp}`,
      external: true,
    },
  ]

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />

      {/* Reach us directly */}
      <Section size="sm">
        <ul className="grid gap-4 sm:grid-cols-3">
          {directLinks.map(({ Icon, label, href, external }, i) => (
            <Reveal as="li" key={href} delay={i * 70}>
              <a
                href={href}
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
      </Section>

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
