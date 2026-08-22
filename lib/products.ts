import productsData from '@/content/products.json'
import categoriesData from '@/content/categories.json'

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  features: string[]
  specs: Record<string, string>
  images: string[]
  categories: string[]
}

export type Category = {
  slug: string
  name: string
  count: number
}

export const PRODUCTS = productsData as unknown as Product[]
export const CATEGORIES = categoriesData as unknown as Category[]

/**
 * Use-case grouping layered on top of the raw Odoo categories.
 * Buyers who know their business but not the part number navigate this way
 * (the pattern zebra.com uses). Matching is by category name keyword.
 */
export const USE_CASES = [
  {
    id: 'retail',
    match: ['pos', 'barcode', 'cash drawer', 'customer display', 'monitor', 'weightscale', 'label'],
  },
  { id: 'hospitality', match: ['kiosk', 'menu display', 'receipt printer', 'all-in-one'] },
  { id: 'warehouse', match: ['data terminal', 'scanner', 'inkjet', 'label printer'] },
  { id: 'unmanned', match: ['vending', 'robot'] },
  { id: 'banking', match: ['banking', 'cdm', 'money counting'] },
] as const

export type UseCaseId = (typeof USE_CASES)[number]['id']

export function useCasesFor(product: Product): UseCaseId[] {
  const haystack = product.categories.join(' ').toLowerCase()
  return USE_CASES.filter((u) => u.match.some((m) => haystack.includes(m))).map((u) => u.id)
}

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug)
}

/** Primary category — the most specific one we have for this product. */
export function primaryCategory(product: Product) {
  if (!product.categories.length) return undefined
  // Prefer the narrowest category (fewest products carrying it).
  return [...product.categories].sort((a, b) => {
    const ca = CATEGORIES.find((c) => c.name === a)?.count ?? 999
    const cb = CATEGORIES.find((c) => c.name === b)?.count ?? 999
    return ca - cb
  })[0]
}

/** Other products sharing a category, for the "related" strip. */
export function relatedProducts(product: Product, limit = 4) {
  if (!product.categories.length) return []
  return PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.categories.some((c) => product.categories.includes(c))
  ).slice(0, limit)
}

/** True when the old Odoo listing carried no real copy for this SKU. */
export function hasDetail(product: Product) {
  return Boolean(
    product.description || product.features.length || Object.keys(product.specs).length
  )
}
