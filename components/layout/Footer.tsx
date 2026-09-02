import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { Phone, Mail, MapPin, BriefcaseBusiness } from 'lucide-react'
import { OFFICES, telHref, mapsUrl } from '@/content/offices'
import { readContact, telHref as salesTelHref, mailtoHref } from '@/lib/contact-settings'
import { QrReveal } from '@/components/ui/QrReveal'
import { FooterSocial } from './FooterSocial'


export async function Footer({ hiring = false }: { hiring?: boolean }) {
  const t = await getTranslations('footer')
  const tEnq = await getTranslations('contact.enquiry')
  const contact = await readContact()
  const tNav = await getTranslations('nav')
  const tContact = await getTranslations('contact')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const base = `/${locale}`

  const links = [
    { href: base, label: tNav('home') },
    { href: `${base}/about`, label: tNav('about') },
    { href: `${base}/ceo`, label: tNav('ceo') },
    { href: `${base}/events`, label: tNav('events') },
    { href: `${base}/careers`, label: tNav('careers') },
    { href: `${base}/solutions`, label: tNav('solutions') },
    { href: `${base}/services`, label: tNav('services') },
    { href: `${base}/products`, label: tNav('products') },
    { href: `${base}/shop`, label: tNav('shop') },
    { href: `${base}/apps`, label: tNav('apps') },
    { href: `${base}/contact`, label: tNav('contact') },
    { href: `${base}/privacy-policy`, label: t('privacy') },
  ]

  return (
    <footer className="border-t border-surface-line bg-surface-alt text-slate-body">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Brand + contact */}
          <div className="max-w-md">
            <Image
              src="/images/brand/logo-369ai.png"
              alt="369AI"
              width={353}
              height={334}
              className="h-12 w-auto"
            />
            <p className="mt-5 text-sm leading-relaxed text-slate-muted">{t('tagline')}</p>
            <p className="mt-2 text-sm font-medium italic text-brand-600">{tCommon('tagline')}</p>

            {/* The contact details are handed to FooterSocial rather than
                rendered beside it: one observer then covers the whole column,
                so the Hiring badge sweeps on the same beat the marks arrive. */}
            <FooterSocial>
              <div className="mt-6 space-y-3 text-sm">
                <a
                  href={salesTelHref(contact.phoneDisplay)}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  {contact.phoneDisplay}
                </a>
                <a
                  href={mailtoHref(contact.email, tEnq('mailSubject'))}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  {contact.email}
                </a>
                {/* Careers sits with the contact details, not only in the link
                    list — it is a way to reach us, and the badge belongs here. */}
                <Link
                  href={`${base}/careers`}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
                >
                  <BriefcaseBusiness className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  {tNav('careers')}
                  {hiring ? <span className="hiring-badge">{tNav('hiring')}</span> : null}
                </Link>
              </div>
            </FooterSocial>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-faint">
              {t('usefulLinks')}
            </p>
            <ul className="dim-siblings grid grid-cols-2 gap-y-2.5 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Offices */}
        <div className="mt-14 border-t border-surface-line pt-10">
          <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-faint">
            {t('offices')}
          </p>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICES.map((office) => (
              <li key={office.id} className="text-sm">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  {office.country} — {office.city}
                </p>

                <div className="mt-2 flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <address className="not-italic leading-relaxed text-slate-muted">
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
                        className="mt-1.5 block font-medium text-brand-600 transition-colors hover:text-brand-800"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>

                </div>

                {/* QR on demand — hover or tap the chip. Only the contact
                    page shows office QRs permanently. */}
                <QrReveal
                  url={mapsUrl(office.mapsQuery)}
                  title={`369AI ${office.country} — ${office.city}`}
                  label={tContact('scanForAddress')}
                  mapsLabel={tContact('openInMaps')}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright on one edge, the build credit on the other. justify-between
            does the flip for Arabic by itself — a flex row in an RTL document
            puts the first child on the right, so the copyright stays on the
            reading-start edge without any logical-property work. Stacked below
            sm: the two do not share a 390px line. */}
        <div className="mt-12 flex flex-col gap-3 border-t border-surface-line pt-6 text-xs text-slate-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} 369AI. {t('rights')}
          </p>

          {/* The wordmark carries the name, so the translated string stops
              where the logo starts — see the note on footer.developedBy. The
              alt text is what gives this link its accessible name. */}
          <a
            href="https://www.alphalize.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-75"
          >
            {t('developedBy')}
            <Image
              src="/images/alphalize-wordmark.png"
              alt="Alphalize"
              width={600}
              height={139}
              sizes="80px"
              className="h-4 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
