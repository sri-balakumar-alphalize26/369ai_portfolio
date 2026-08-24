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
}

export default withNextIntl(nextConfig)
