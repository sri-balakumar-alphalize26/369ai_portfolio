import type { Locale } from '@/i18n/routing'

/**
 * Inline SVG flags for the locale picker.
 *
 * Deliberately not emoji flags (🇴🇲 etc.): Windows ships no flag glyphs, so
 * those render as bare letter pairs ("OM"). These are simplified but
 * recognisable, and render identically on every platform.
 */
export function Flag({ locale, className = 'h-4 w-6' }: { locale: Locale; className?: string }) {
  const common = {
    viewBox: '0 0 24 16',
    className: `${className} shrink-0 rounded-[2px] ring-1 ring-black/10`,
    'aria-hidden': true as const,
  }

  switch (locale) {
    // English — shown as "Global": a bare globe symbol, deliberately NOT in a
    // flag-style rectangle. It inherits currentColor, so it reads as an icon
    // beside the flags rather than as one more country.
    case 'en':
      return (
        <svg
          viewBox="0 0 24 16"
          className={`${className} shrink-0`}
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="8" r="6" />
            <ellipse cx="12" cy="8" rx="2.4" ry="6" />
            <path d="M6.1 8h11.8M7 4.8h10M7 11.2h10" />
          </g>
        </svg>
      )

    // Oman — white / red / green with the red hoist band.
    case 'ar':
      return (
        <svg {...common}>
          <rect width="24" height="5.34" fill="#fff" />
          <rect y="5.34" width="24" height="5.33" fill="#db161b" />
          <rect y="10.67" width="24" height="5.33" fill="#0b7a3c" />
          <rect width="7" height="16" fill="#db161b" />
        </svg>
      )

    // Bangladesh — green field, offset red disc.
    case 'bn':
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#006a4e" />
          <circle cx="10.5" cy="8" r="4.4" fill="#f42a41" />
        </svg>
      )

    // China — red field with the large star (smaller stars omitted at this size).
    case 'zh':
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#de2910" />
          <path
            fill="#ffde00"
            d="M6 2.6l1.06 3.26h3.43l-2.78 2.02 1.06 3.26L6 9.12l-2.77 2.02L4.3 7.88 1.5 5.86h3.44z"
          />
        </svg>
      )

    // France — blue / white / red vertical.
    case 'fr':
      return (
        <svg {...common}>
          <rect width="8" height="16" fill="#002395" />
          <rect x="8" width="8" height="16" fill="#fff" />
          <rect x="16" width="8" height="16" fill="#ed2939" />
        </svg>
      )

    // Germany — black / red / gold horizontal.
    case 'de':
      return (
        <svg {...common}>
          <rect width="24" height="5.34" fill="#000" />
          <rect y="5.34" width="24" height="5.33" fill="#dd0000" />
          <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
        </svg>
      )

    // India — saffron / white / green with the Ashoka chakra. One flag for
    // all three Indian languages; the picker draws it once per region anyway.
    case 'hi':
    case 'ta':
    case 'ml':
      return (
        <svg {...common}>
          <rect width="24" height="5.34" fill="#ff9933" />
          <rect y="5.34" width="24" height="5.33" fill="#fff" />
          <rect y="10.67" width="24" height="5.33" fill="#138808" />
          <circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
          <circle cx="12" cy="8" r="0.5" fill="#000080" />
        </svg>
      )

    // Falling off the end used to return undefined, which React renders as
    // nothing — a new locale lost its flag with no build error and no lint
    // warning. This turns that into a compile error instead: `locale` is only
    // `never` here while every locale above is handled.
    default: {
      const unhandled: never = locale
      void unhandled
      return null
    }
  }
}
