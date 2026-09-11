import { defineRouting } from 'next-intl/routing'

/**
 * The seven locales the old Odoo site offered, kept identical so existing
 * links and search rankings carry over, plus Tamil and Malayalam.
 *
 * ORDER IS LOAD-BEARING — this array is the display order of the picker.
 * India sits second, straight after Global: this is an Indian company and its
 * home market should not be last in its own language menu.
 *
 * The picker groups by region positionally — a group breaks when the region
 * label changes — so same-region entries have to stay adjacent. India's three
 * languages (hi, ta, ml) are contiguous on purpose; split them and the picker
 * prints "India" three times with three identical flags. Reordering this array
 * is a UI change, and nothing else reads it in order.
 */
export const locales = ['en', 'hi', 'ta', 'ml', 'ar', 'bn', 'zh', 'fr', 'de'] as const
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
