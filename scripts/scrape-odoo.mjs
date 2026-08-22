/**
 * One-time migration: pulls the product catalog off the old Odoo site
 * (369ai.biz) into content/products.json + local WebP images.
 *
 * Safe to re-run: HTML responses are cached under scripts/.cache/.
 *   node scripts/scrape-odoo.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGIN = 'https://369ai.biz'
const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE = path.join(ROOT, 'scripts', '.cache')
const IMG_OUT = path.join(ROOT, 'public', 'images', 'products')
const CONTENT = path.join(ROOT, 'content')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- fetching

async function getHTML(urlPath) {
  const key = urlPath.replace(/[^a-z0-9]/gi, '_').slice(0, 120) + '.html'
  const cached = path.join(CACHE, key)
  try {
    return await fs.readFile(cached, 'utf8')
  } catch {
    /* not cached yet */
  }
  await sleep(500) // ~2 req/sec, be polite to their server
  const res = await fetch(ORIGIN + urlPath, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlPath}`)
  const html = await res.text()
  await fs.mkdir(CACHE, { recursive: true })
  await fs.writeFile(cached, html)
  return html
}

// ---------------------------------------------------------------- parsing

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  deg: '°',
  times: '×',
}

function decode(s = '') {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&([a-z0-9]+);/gi, (m, e) => ENTITIES[e] ?? ENTITIES[e.toLowerCase()] ?? m)
}

const strip = (s = '') => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

/**
 * Product links appear in two shapes on this site:
 *   /shop/<slug>-<id>                  (main shop grid)
 *   /shop/<category-slug>/<slug>-<id>  (category pages)
 * Both point at the same product, so we always keep the final segment.
 */
const PRODUCT_HREF = /href="\/shop\/(?!category\/)(?:[a-z0-9-]+\/)?([a-z0-9-]+-\d+)"/g

function productSlugs(html) {
  return [...new Set([...html.matchAll(PRODUCT_HREF)].map((m) => m[1]))]
}

/** Pull one Odoo "s_features_wave" section out by its <h2> heading. */
function sectionByHeading(html, heading) {
  const re = /<section[^>]*s_features_wave[\s\S]*?<\/section>/g
  for (const m of html.matchAll(re)) {
    const h2 = m[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
    if (h2 && strip(h2[1]).toLowerCase() === heading.toLowerCase()) return m[0]
  }
  return null
}

function parseFeatures(html) {
  const sec = sectionByHeading(html, 'Features')
  if (!sec) return []
  const out = []
  // each feature card: a numbered <h1> then one or more <p> of text
  for (const card of sec.matchAll(/<div[^>]*col-lg-\d[^>]*>([\s\S]*?)<\/div>/g)) {
    const inner = card[1]
    if (/<h2/.test(inner)) continue // that is the section heading cell
    for (const p of inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
      const t = strip(p[1])
      if (t && t.length > 2 && !/^\d+$/.test(t)) out.push(t)
    }
  }
  return [...new Set(out)]
}

function parseSpecs(html) {
  const sec = sectionByHeading(html, 'Specifications')
  if (!sec) return {}
  const specs = {}
  for (const card of sec.matchAll(/<div[^>]*col-lg-\d[^>]*>([\s\S]*?)<\/div>/g)) {
    const inner = card[1]
    if (/<h2/.test(inner)) continue
    const label = inner.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
    if (!label) continue
    const key = strip(label[1])
    const vals = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((p) => strip(p[1]))
      .filter(Boolean)
    if (key && vals.length) specs[key] = vals.join(' ')
  }
  return specs
}

function parseProduct(html, slug, id) {
  const og = html.match(/<meta property="og:title" content="([^"]*)"/)
  const h1 = html.match(
    /o_wsale_product_details_content_section_title[\s\S]{0,400}?<h1[^>]*>([\s\S]*?)<\/h1>/
  )
  const name = strip(og?.[1] || h1?.[1] || slug)

  const descBlock = html.match(
    /<div placeholder="A detailed, formatted description[\s\S]*?class="oe_structure[^"]*"[^>]*>([\s\S]*?)<\/div>/
  )
  let description = ''
  if (descBlock) {
    description = [...descBlock[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((p) => strip(p[1]))
      .filter(Boolean)
      .join(' ')
  }

  // gallery images, biggest available size
  const imgIds = new Set()
  for (const m of html.matchAll(/\/web\/image\/product\.image\/(\d+)\/image_\d+/g)) {
    imgIds.add(m[1])
  }
  const tpl = html.match(/\/web\/image\/product\.template\/(\d+)\/image_\d+/)
  const images = []
  if (tpl) images.push(`/web/image/product.template/${tpl[1]}/image_1920`)
  for (const i of imgIds) images.push(`/web/image/product.image/${i}/image_1920`)

  return {
    id,
    slug,
    name,
    description,
    features: parseFeatures(html),
    specs: parseSpecs(html),
    images,
  }
}

// ---------------------------------------------------------------- images

async function downloadImages(product) {
  const dir = path.join(IMG_OUT, product.slug)
  await fs.mkdir(dir, { recursive: true })
  const saved = []
  for (const [i, src] of product.images.entries()) {
    const file = `${i}.webp`
    const dest = path.join(dir, file)
    try {
      await fs.access(dest)
      saved.push(`/images/products/${product.slug}/${file}`)
      continue // already downloaded
    } catch {
      /* need to fetch */
    }
    try {
      const res = await fetch(ORIGIN + src, { headers: { 'User-Agent': UA } })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1024) continue // Odoo placeholder
      await sharp(buf)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(dest)
      saved.push(`/images/products/${product.slug}/${file}`)
      await sleep(120)
    } catch (err) {
      console.warn(`  ! image failed ${src}: ${err.message}`)
    }
  }
  return saved
}

// ---------------------------------------------------------------- main

async function main() {
  console.log('1/4  Mapping categories...')
  const shop = await getHTML('/shop')
  const catPaths = [
    ...new Set([...shop.matchAll(/href="(\/shop\/category\/[^"]+)"/g)].map((m) => m[1])),
  ]

  const categories = []
  const productCats = new Map() // slug -> Set(category name)

  for (const cp of catPaths) {
    const slugFull = cp.replace('/shop/category/', '')
    let html
    try {
      html = await getHTML(cp)
    } catch (err) {
      console.warn(`     ! ${slugFull}: ${err.message}`)
      continue
    }
    // The page title is the cleanest source: "POS Machines | My Website"
    const title = strip((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '')
    const label =
      title.split('|')[0].trim() || slugFull.replace(/-\d+$/, '').replace(/-/g, ' ')
    const prods = productSlugs(html)
    categories.push({ slug: slugFull, name: label, count: prods.length })
    for (const s of prods) {
      if (!productCats.has(s)) productCats.set(s, new Set())
      productCats.get(s).add(label)
    }
    console.log(`     ${label} - ${prods.length}`)
  }

  console.log('\n2/4  Listing all products...')
  const urls = new Set()
  for (let page = 1; page <= 6; page++) {
    let html
    try {
      html = await getHTML(page === 1 ? '/shop' : `/shop/page/${page}`)
    } catch {
      break
    }
    const found = productSlugs(html)
    const before = urls.size
    found.forEach((u) => urls.add(u))
    console.log(`     page ${page}: ${found.length} links, ${urls.size - before} new`)
    if (urls.size === before && page > 1) break // past the end
  }
  for (const s of productCats.keys()) urls.add(s)

  // dedupe by trailing numeric id (the same SKU can appear under two slugs)
  const byId = new Map()
  for (const s of urls) {
    const id = s.match(/-(\d+)$/)?.[1]
    if (id && !byId.has(id)) byId.set(id, s)
  }
  console.log(`     ${byId.size} unique products\n`)

  console.log('3/4  Fetching product pages...')
  const products = []
  const problems = []
  let n = 0
  for (const [id, slug] of byId) {
    n++
    try {
      const html = await getHTML('/shop/' + slug)
      const p = parseProduct(html, slug, id)
      p.categories = [...(productCats.get(slug) || [])]
      p.images = await downloadImages(p)
      products.push(p)
      const gaps = []
      if (!p.images.length) gaps.push('no-images')
      if (!p.description) gaps.push('no-description')
      if (!Object.keys(p.specs).length) gaps.push('no-specs')
      if (!p.features.length) gaps.push('no-features')
      if (gaps.length) problems.push(`${slug}: ${gaps.join(', ')}`)
      console.log(
        `     [${n}/${byId.size}] ${p.name.slice(0, 58)}${gaps.length ? '  (' + gaps.join(',') + ')' : ''}`
      )
    } catch (err) {
      problems.push(`${slug}: FAILED ${err.message}`)
      console.warn(`     [${n}/${byId.size}] FAILED ${slug}: ${err.message}`)
    }
  }

  console.log('\n4/4  Writing content/...')
  await fs.mkdir(CONTENT, { recursive: true })
  products.sort((a, b) => a.name.localeCompare(b.name))
  await fs.writeFile(path.join(CONTENT, 'products.json'), JSON.stringify(products, null, 2))
  const usedCats = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
  await fs.writeFile(path.join(CONTENT, 'categories.json'), JSON.stringify(usedCats, null, 2))

  console.log('\n=== DONE ===')
  console.log(`products:   ${products.length}`)
  console.log(`categories: ${usedCats.length}`)
  console.log(`images:     ${products.reduce((s, p) => s + p.images.length, 0)}`)
  if (problems.length) {
    console.log(`\n--- ${problems.length} gaps to review ---`)
    problems.forEach((p) => console.log('  ' + p))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
