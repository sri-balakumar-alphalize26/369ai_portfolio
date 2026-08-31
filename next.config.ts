import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    // Grid cards ship q70 (300px tiles do not need q75 of 1200px sources);
    // Next 16 requires every non-default quality to be declared here.
    qualities: [70, 75],
    // Optimized variants are immutable per source file — cache for 31 days.
    minimumCacheTTL: 2678400,
  },

  async redirects() {
    return [
      {
        /**
         * The instant lock: `?manage=0` on any page hands off to the route
         * handler that clears the session cookie and sends the visitor back
         * without the parameter.
         *
         * It lives in the config rather than in the page or the proxy because
         * these pages are prerendered — `/en?manage=0` answers from the static
         * shell (`x-nextjs-prerender: 1`, `x-nextjs-cache: HIT`), so a
         * redirect() inside the page body never runs and cannot change the
         * response status. Config redirects are applied before routing and
         * caching, so this one always fires.
         *
         * `manage=1` is untouched: it is a state the pages read themselves.
         */
        /**
         * The lock route is excluded from the source, or this rule matches its
         * own destination: config redirects forward the incoming query, so the
         * handler would arrive carrying `manage=0` and bounce forever.
         */
        source: '/:path((?!api/manage/lock).*)',
        has: [{ type: 'query', key: 'manage', value: '0' }],
        permanent: false,
        destination: '/api/manage/lock?next=/:path',
      },
    ]
  },
}

export default withNextIntl(nextConfig)
