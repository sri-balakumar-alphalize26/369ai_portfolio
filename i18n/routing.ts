import { defineRouting } from 'next-intl/routing'

/**
 * The seven locales the old Odoo site offered, kept identical so existing
 * links and search rankings carry over, plus Tamil and Malayalam.
 *
 * ta and ml sit directly after hi on purpose: the picker groups by region, and
 * India's three languages have to be contiguous for that grouping to read as
 * one block.
 */
export const locales = ['en', 'ar', 'bn', 'zh', 'fr', 'de', 'hi', 'ta', 'ml'] as const
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
  // Three languages share the India region — the picker prints the heading
  // once and lists them under it, rather than repeating 'India' three times.
  hi: { region: 'India', language: 'हिन्दी', hreflang: 'hi' },
  ta: { region: 'India', language: 'தமிழ்', hreflang: 'ta' },
  ml: { region: 'India', language: 'മലയാളം', hreflang: 'ml' },
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
