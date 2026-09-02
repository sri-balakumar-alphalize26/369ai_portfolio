'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { MessageCircle, X, Send, ArrowUpRight } from 'lucide-react'
import { PRODUCTS, hasDetail } from '@/lib/products'
import type { ContactSettings } from '@/lib/contact-settings'
import { FAQ_CATS } from '@/content/faq'
import { APPS } from '@/content/apps'
import { ERP_MODULES, POS_FEATURES } from '@/content/modules'
import { TECH_ROWS } from '@/content/technologies'
import {
  findAnswer,
  tokenSet,
  type Entry,
  type Answer,
  type ProductEntry,
} from '@/lib/assistant-knowledge'
import { cn } from '@/lib/cn'

const GREETING_KEY = '369ai:greeting-dismissed'

/**
 * 'showroomCheck' and '369 Showroom Check' both become ['showroom', 'check'].
 * App ids are camelCase and their names carry the brand, but a visitor types
 * neither — they type the words inside them.
 */
function words(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

type Message = { role: 'user' | 'bot'; text: string; answer?: Answer }

export function Assistant({ contact }: { contact: ContactSettings }) {
  const t = useTranslations('assistant')
  const tFaq = useTranslations('faq')
  const tSrv = useTranslations('services')
  const tSol = useTranslations('solutions')
  const tApps = useTranslations('appsPage')
  const tProd = useTranslations('products')
  const locale = useLocale()

  const [open, setOpen] = useState(false)
  const [greeting, setGreeting] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const base = `/${locale}`

  // Everything the assistant is allowed to say, drawn from published copy.
  const knowledge = useMemo<Entry[]>(() => {
    const faq = FAQ_CATS.flatMap(({ key, count }) =>
      Array.from({ length: count }, (_, i) => ({
        id: `faq-${key}-${i + 1}`,
        title: tFaq(`cats.${key}.q${i + 1}`),
        body: tFaq(`cats.${key}.a${i + 1}`),
      }))
    )

    const services = ['pos', 'erp', 'ai', 'iot', 'cloud', 'support'].map((k) => ({
      id: `service-${k}`,
      title: tSrv(`${k}.title`),
      body: `${tSrv(`${k}.lead`)} ${tSrv(`${k}.body`)}`,
      href: `${base}/services#${k}`,
    }))

    const solutions = ['erp', 'pos', 'robotics', 'locks', 'vending'].map((k) => ({
      id: `solution-${k}`,
      title: tSol(`${k}.title`),
      body: `${tSol(`${k}.body`)} ${tSol(`${k}.tagline`)}`,
      href: `${base}/solutions#${k}`,
    }))

    // One entry per app, from the copy the /apps page already renders. 'app'
    // is a keyword on every one so "attendance app" beats the Attendance Suite
    // ERP module, which shares the word but not the subject.
    const apps = APPS.map((app) => ({
      id: `app-${app.id}`,
      keywords: ['app', 'apps', ...words(app.id), ...words(app.name)],
      title: app.name,
      body: [
        tApps(`items.${app.id}.tagline`),
        tApps(`items.${app.id}.f1`),
        tApps(`items.${app.id}.f2`),
        tApps(`items.${app.id}.f3`),
      ].join(' '),
      href: `${base}/apps`,
    }))

    // ERP modules and POS features carry no keywords on purpose. Their titles
    // are already the words a visitor types — "loyalty card", "vehicle
    // tracking" — and a generic one like 'pos' would pull fifteen modules
    // level with the POS solution page.
    const modules = ERP_MODULES.map((key) => ({
      id: `module-${key}`,
      title: tProd(`modules.${key}.t`),
      body: tProd(`modules.${key}.b`),
      href: `${base}/products`,
    }))

    const posFeatures = POS_FEATURES.map((key) => ({
      id: `pos-${key}`,
      title: tProd(`pos.${key}.t`),
      body: tProd(`pos.${key}.b`),
      href: `${base}/products`,
    }))

    const stack = TECH_ROWS.flat().map((tech) => tech.name)
    const technologies: Entry = {
      id: 'technologies',
      // Multi-word and slashed names ('React Native', 'ESC/POS') can never
      // match a single query token, so they cost nothing to carry; the
      // one-word names — odoo, python, expo, firebase — do the work.
      keywords: stack.map((name) => name.toLowerCase()),
      title: t('techTitle'),
      body: t('techBody', { stack: stack.join(', ') }),
    }

    const extras: Entry[] = [
      {
        id: 'contact',
        // 'located' as well as 'location': the stemmer strips plurals, not -ed.
        keywords: [
          'contact', 'phone', 'email', 'call', 'reach',
          'address', 'office', 'location', 'located',
        ],
        title: t('contactTitle'),
        body: t('contactBody', { phone: contact.phoneDisplay, email: contact.email }),
        href: `${base}/contact`,
      },
      {
        id: 'pricing',
        keywords: ['price', 'pricing', 'cost', 'quote', 'quotation', 'how much', 'budget'],
        title: t('pricingTitle'),
        body: t('pricingBody'),
        href: `${base}/shop`,
      },
      {
        id: 'hardware',
        keywords: ['hardware', 'catalogue', 'catalog', 'products', 'buy', 'shop', 'range'],
        title: t('hardwareTitle'),
        body: t('hardwareBody', { count: PRODUCTS.length }),
        href: `${base}/shop`,
      },
      {
        id: 'apps',
        // The per-app words moved to the ten entries above. Left here, this
        // generic entry would outscore the specific one every time.
        keywords: ['app', 'apps', 'mobile', 'android', 'apk', 'application'],
        title: t('appsTitle'),
        body: t('appsBody'),
        href: `${base}/apps`,
      },
      {
        id: 'events',
        keywords: [
          'event', 'events', 'expo', 'exhibition', 'trade', 'kozhikode', 'calicut',
          'stall', 'bizconnect', 'award', 'robot', 'vending',
        ],
        title: t('eventsTitle'),
        body: t('eventsBody'),
        href: `${base}/events`,
      },
      {
        id: 'ceo',
        keywords: [
          'ceo', 'founder', 'owner', 'director', 'managing', 'md', 'shan',
          'sahib', 'leader', 'leadership', 'management', 'who', 'runs',
        ],
        title: t('ceoTitle'),
        body: t('ceoBody'),
        href: `${base}/ceo`,
      },
      {
        id: 'careers',
        keywords: [
          'career', 'careers', 'job', 'jobs', 'vacancy', 'vacancies', 'hiring',
          'hire', 'apply', 'application', 'cv', 'resume', 'opening', 'openings',
          'developer', 'odoo developer', 'frontend', 'sysadmin', 'walk in',
        ],
        title: t('careersTitle'),
        body: t('careersBody'),
        href: `${base}/careers`,
      },
    ]

    // Apps before modules: the two tie on shared words like "attendance", and
    // a stable sort then hands the question to the app, which is what someone
    // typing a product name almost always means.
    return [
      ...faq,
      ...services,
      ...solutions,
      ...apps,
      ...modules,
      ...posFeatures,
      ...extras,
      technologies,
    ]
  }, [t, tFaq, tSrv, tSol, tApps, tProd, base, contact])

  const productIndex = useMemo<ProductEntry[]>(
    () =>
      PRODUCTS.map((p) => ({
        name: p.name,
        href: `${base}/shop/${p.slug}`,
        label: tokenSet(`${p.name} ${p.categories.join(' ')}`),
        // Only 37 of the 75 carry any detail; hasDetail keeps the rest empty
        // rather than tokenizing three empty strings apiece.
        detail: hasDetail(p)
          ? tokenSet(
              `${p.description} ${p.features.join(' ')} ${Object.values(p.specs).join(' ')}`
            )
          : new Set<string>(),
      })),
    [base]
  )

  // Greeting bubble appears once per session, a few seconds in.
  useEffect(() => {
    let dismissed = true
    try {
      dismissed = sessionStorage.getItem(GREETING_KEY) === '1'
    } catch {
      dismissed = true
    }
    if (dismissed) return
    const timer = setTimeout(() => setGreeting(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function dismissGreeting() {
    setGreeting(false)
    try {
      sessionStorage.setItem(GREETING_KEY, '1')
    } catch {
      /* storage blocked — the bubble simply reappears next session */
    }
  }

  function launch() {
    dismissGreeting()
    setOpen(true)
  }

  function ask(e: React.FormEvent) {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    const answer = findAnswer(question, knowledge, productIndex, {
      fallback: t('offline'),
      productsFound: (count) => t('productsFound', { count }),
    })
    setMessages((m) => [...m, { role: 'user', text: question }, { role: 'bot', text: '', answer }])
    setInput('')
  }

  const whatsappHref = `https://wa.me/${contact.phoneDisplay.replace(/\D/g, '')}?text=${encodeURIComponent(
    t('whatsappPrefill')
  )}`

  return (
    <>
      {/* Greeting bubble */}
      {greeting && !open ? (
        <div className="fixed bottom-24 end-5 z-[60] max-w-[19rem] rounded-panel border border-surface-line bg-white p-4 shadow-xl shadow-slate-900/10 sm:end-6">
          <button
            type="button"
            onClick={dismissGreeting}
            aria-label={t('dismiss')}
            className="absolute end-2 top-2 rounded p-1 text-slate-faint transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          <p className="pe-4 text-sm leading-relaxed text-slate-body">{t('greeting')}</p>
          <button
            type="button"
            onClick={launch}
            className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
          >
            {t('launcherLabel')} →
          </button>
        </div>
      ) : null}

      {/* Launcher */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : launch())}
        aria-label={t('launcherLabel')}
        aria-expanded={open}
        className="fixed bottom-5 end-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-blue-900/25 transition-colors hover:bg-brand-600 sm:end-6"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden />
        )}
      </button>

      {/* Panel */}
      {open ? (
        <div
          role="dialog"
          aria-label={t('title')}
          className="fixed bottom-24 end-3 z-[60] flex max-h-[min(32rem,calc(100dvh-8rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-panel border border-surface-line bg-white shadow-2xl shadow-slate-900/20 sm:end-6"
        >
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-4">
            <p className="font-semibold text-white">{t('title')}</p>
            <p className="mt-0.5 text-xs text-slate-400">{t('subtitle')}</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="rounded-card bg-surface-alt p-3.5 text-sm leading-relaxed text-slate-body">
                {t('greeting')}
              </div>
            ) : null}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <p
                  key={i}
                  className="ms-auto w-fit max-w-[85%] rounded-card bg-brand-500 px-3.5 py-2.5 text-sm text-white"
                >
                  {m.text}
                </p>
              ) : (
                <BotMessage key={i} answer={m.answer!} wa={whatsappHref} />
              )
            )}
          </div>

          <div className="border-t border-surface-line p-3">
            <form onSubmit={ask} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
                className="h-10 min-w-0 flex-1 rounded-pill border border-surface-line px-4 text-sm outline-none transition-colors focus:border-brand-400"
              />
              <button
                type="submit"
                aria-label={t('send')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </button>
            </form>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                {t('whatsapp')}
              </a>
              <p className="text-[0.65rem] text-slate-faint">{t('disclaimer')}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function BotMessage({ answer, wa }: { answer: Answer; wa: string }) {
  const t = useTranslations('assistant')
  const whatsappHref = wa

  return (
    <div className="max-w-[92%] rounded-card bg-surface-alt p-3.5">
      {answer.title ? (
        <p className="mb-1 text-sm font-semibold text-ink">{answer.title}</p>
      ) : null}
      <p className="text-sm leading-relaxed text-slate-body">{answer.body}</p>

      {answer.products?.length ? (
        <ul className="mt-3 space-y-1.5">
          {answer.products.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="flex items-start gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {answer.href ? (
        <Link
          href={answer.href}
          className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
        >
          {t('readMore')}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : null}

      {!answer.matched ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-pill bg-brand-500',
            'px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-600'
          )}
        >
          {t('whatsapp')}
        </a>
      ) : null}
    </div>
  )
}
