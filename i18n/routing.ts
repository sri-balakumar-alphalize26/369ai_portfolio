import { defineRouting } from 'next-intl/routing'

/**
 * The seven locales the old Odoo site offered, kept identical so existing
 * links and search rankings carry over.
 */
export const locales = ['en', 'ar', 'bn', 'zh', 'fr', 'de', 'hi'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Right-to-left locales need dir="rtl" on <html>. */
export const rtlLocales: Locale[] = ['ar']

export function isRtl(locale: string) {
  return rtlLocales.includes(locale as Locale)
}

/**
 * Region–language labels, following the HCLTech pattern — a visitor picks
 * "Oman – العربية", not a bare language code.
 */
export const localeLabels: Record<Locale, { region: string; language: string; hreflang: string }> = {
  en: { region: 'Global', language: 'English', hreflang: 'en' },
  ar: { region: 'Oman & UAE', language: 'العربية', hreflang: 'ar' },
  bn: { region: 'Bangladesh', language: 'বাংলা', hreflang: 'bn' },
  zh: { region: 'China', language: '简体中文', hreflang: 'zh-Hans' },
  fr: { region: 'France', language: 'Français', hreflang: 'fr' },
  de: { region: 'Germany', language: 'Deutsch', hreflang: 'de' },
  hi: { region: 'India', language: 'हिन्दी', hreflang: 'hi' },
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
