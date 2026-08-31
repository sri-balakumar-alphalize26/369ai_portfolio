import { notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Download, FileText, Mail, MessageCircle } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { readApplications } from '@/lib/careers'
import { isUnlocked } from '@/lib/careers-auth'
import { DeleteApplication } from '@/components/careers/DeleteApplication'

/**
 * Who applied, for what, and their CV. Owner-only: without the passcode
 * session this is a plain 404 rather than a "forbidden", so the page does not
 * advertise that anything is here.
 *
 * English only and outside the message catalogs — no visitor ever sees it.
 */
export const dynamic = 'force-dynamic'

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  if (!(await isUnlocked())) notFound()

  const applications = await readApplications()
  const base = `/${locale}`

  return (
    <Section className="pt-32 sm:pt-36 lg:pt-40">
      <Link
        href={`${base}/careers`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        Back to careers
      </Link>

      <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Applications</h1>
      <p className="mt-3 text-slate-muted">
        {applications.length} received. Newest first. Files live in{' '}
        <code className="rounded bg-surface-alt px-1.5 py-0.5 text-[0.85em]">data/applications</code>
        {' '}on this machine.
      </p>

      {applications.length ? (
        <ul className="mt-10 space-y-4">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded-panel border border-surface-line bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{application.name}</p>
                  <p className="mt-1 text-sm text-slate-muted">
                    {application.role} ·{' '}
                    {new Date(application.submittedAt).toLocaleString(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <DeleteApplication id={application.id} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <a
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center gap-2 text-brand-600 hover:underline"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {application.email}
                </a>
                <a
                  href={`https://wa.me/${application.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 hover:underline"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {application.phone}
                </a>
                <a
                  href={`/api/cv/${application.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-pill bg-gradient-to-r from-brand-700 to-brand-500 px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  CV
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-panel border border-surface-line bg-white p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-faint" aria-hidden />
          <p className="mt-4 text-slate-muted">
            Nothing yet. Applications appear here the moment someone submits one.
          </p>
        </div>
      )}
    </Section>
  )
}
