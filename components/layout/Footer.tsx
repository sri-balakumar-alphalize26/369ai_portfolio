import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { Phone, Mail, MapPin } from 'lucide-react'
import { OFFICES, CONTACT, telHref, mapsUrl } from '@/content/offices'
import { QrReveal } from '@/components/ui/QrReveal'

/**
 * Brand marks as inline paths — lucide-react removed its brand icon set, and
 * these are simple enough not to warrant another dependency.
 */
const SOCIALS = [
  {
    href: 'https://www.facebook.com/DANATGROUPDXB',
    label: 'Facebook',
    path: 'M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z',
  },
  {
    href: 'https://twitter.com',
    label: 'X',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z',
  },
  {
    href: 'https://linkedin.com',
    label: 'LinkedIn',
    path: 'M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z',
  },
  {
    href: 'https://www.youtube.com/@shanontech4849',
    label: 'YouTube',
    path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z',
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    path: 'M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  },
]

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const tContact = await getTranslations('contact')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const base = `/${locale}`

  const links = [
    { href: base, label: tNav('home') },
    { href: `${base}/about`, label: tNav('about') },
    { href: `${base}/events`, label: tNav('events') },
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

            <div className="mt-6 space-y-3 text-sm">
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
              >
                <Phone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                {CONTACT.email}
              </a>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-faint">
                {t('follow')}
              </p>
              <ul className="flex gap-2.5">
                {SOCIALS.map(({ href, label, path }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-line bg-white text-slate-muted transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-brand-500 hover:text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d={path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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

        <div className="mt-12 border-t border-surface-line pt-6 text-xs text-slate-faint">
          © {new Date().getFullYear()} 369AI. {t('rights')}
        </div>
      </div>
    </footer>
  )
}
