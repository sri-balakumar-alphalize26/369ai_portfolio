'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { MessageCircle, X, Send, ArrowUpRight } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'
import { CONTACT } from '@/content/offices'
import { findAnswer, type Entry, type Answer } from '@/lib/assistant-knowledge'
import { cn } from '@/lib/cn'

const GREETING_KEY = '369ai:greeting-dismissed'

type Message = { role: 'user' | 'bot'; text: string; answer?: Answer }

export function Assistant() {
  const t = useTranslations('assistant')
  const tFaq = useTranslations('faq')
  const tSrv = useTranslations('services')
  const tSol = useTranslations('solutions')
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
    const faq = [1, 2, 3, 4, 5, 6].map((n) => ({
      id: `faq-${n}`,
      title: tFaq(`q${n}`),
      body: tFaq(`a${n}`),
    }))

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

    const extras: Entry[] = [
      {
        id: 'contact',
        keywords: ['contact', 'phone', 'email', 'call', 'reach', 'address', 'office', 'location'],
        title: t('contactTitle'),
        body: t('contactBody', { phone: CONTACT.phoneDisplay, email: CONTACT.email }),
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
    ]

    return [...faq, ...services, ...solutions, ...extras]
  }, [t, tFaq, tSrv, tSol, base])

  const productIndex = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        name: p.name,
        href: `${base}/shop/${p.slug}`,
        haystack: `${p.name} ${p.categories.join(' ')}`.toLowerCase(),
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
    const answer = findAnswer(question, knowledge, productIndex, t('offline'))
    setMessages((m) => [...m, { role: 'user', text: question }, { role: 'bot', text: '', answer }])
    setInput('')
  }

  const whatsappHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
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
                <BotMessage key={i} answer={m.answer!} />
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

function BotMessage({ answer }: { answer: Answer }) {
  const t = useTranslations('assistant')
  const whatsappHref = `https://wa.me/${CONTACT.whatsapp}`

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
