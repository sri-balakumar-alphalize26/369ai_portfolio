import { getRequestConfig } from 'next-intl/server'
import { hasLocale, IntlErrorCode } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // A typo'd or not-yet-translated key should degrade to readable text, not
    // render a raw dotted key path in the UI. Missing-message errors are
    // expected during catalog edits, so keep them out of the error log noise;
    // everything else still surfaces.
    onError(error) {
      if (error.code !== IntlErrorCode.MISSING_MESSAGE) console.error(error)
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter(Boolean).join('.')
      return error.code === IntlErrorCode.MISSING_MESSAGE ? path.split('.').pop()! : path
    },
  }
})
