/**
 * The assistant's brain — deliberately not an LLM.
 *
 * It ranks the visitor's question against content 369AI actually published
 * (FAQ answers, service and solution copy, and the 75-product catalog) and
 * returns the best matches verbatim. That means it costs nothing to run, needs
 * no API key, answers instantly, and — most importantly for a corporate site —
 * it physically cannot invent a specification or promise a product that
 * does not exist.
 */

export type Entry = {
  id: string
  /** Words that should pull this entry up, beyond those in title/body. */
  keywords?: string[]
  title: string
  body: string
  href?: string
}

export type Answer = {
  body: string
  title?: string
  href?: string
  /** Product suggestions to render as links under the answer. */
  products?: { name: string; href: string }[]
  /** False when we found nothing and are handing off to WhatsApp. */
  matched: boolean
}

const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'does',
  'for', 'from', 'has', 'have', 'how', 'i', 'in', 'is', 'it', 'its', 'me',
  'my', 'of', 'on', 'or', 'our', 'that', 'the', 'their', 'them', 'there',
  'these', 'they', 'this', 'to', 'us', 'was', 'we', 'what', 'when', 'where',
  'which', 'who', 'will', 'with', 'would', 'you', 'your', 'want', 'need',
  'please', 'tell', 'give', 'get', 'about', 'any',
])

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

/** Light stemmer: strips common English plurals so "scanners" hits "scanner". */
function stem(word: string) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y'
  if (word.length > 3 && word.endsWith('es')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1)
  return word
}

function scoreEntry(queryTokens: string[], entry: Entry) {
  const title = tokenize(entry.title).map(stem)
  const body = tokenize(entry.body).map(stem)
  const keys = (entry.keywords ?? []).map((k) => stem(k.toLowerCase()))

  let score = 0
  for (const raw of queryTokens) {
    const q = stem(raw)
    // Explicit keywords are the strongest signal, then title, then body.
    if (keys.includes(q)) score += 6
    if (title.includes(q)) score += 4
    else if (title.some((t) => t.startsWith(q) || q.startsWith(t))) score += 2
    if (body.includes(q)) score += 1
  }
  return score
}

export function findAnswer(
  query: string,
  knowledge: Entry[],
  products: { name: string; href: string; haystack: string }[],
  fallback: string
): Answer {
  const tokens = tokenize(query)
  if (!tokens.length) return { body: fallback, matched: false }

  // 1. Best content match (FAQ / service / solution).
  const ranked = knowledge
    .map((entry) => ({ entry, score: scoreEntry(tokens, entry) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  // 2. Matching products — the visitor may be asking "do you sell X?".
  const stems = tokens.map(stem)
  const productHits = products
    .map((p) => {
      const hay = p.haystack
      let score = 0
      for (const s of stems) if (hay.includes(s)) score += 1
      return { p, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => ({ name: r.p.name, href: r.p.href }))

  const best = ranked[0]

  // A confident content match wins; otherwise lead with products if we found any.
  if (best && best.score >= 4) {
    return {
      title: best.entry.title,
      body: best.entry.body,
      href: best.entry.href,
      products: productHits.length ? productHits : undefined,
      matched: true,
    }
  }

  if (productHits.length) {
    return {
      body: `We have ${productHits.length === 5 ? 'several' : productHits.length} item${
        productHits.length === 1 ? '' : 's'
      } that may match. Here ${productHits.length === 1 ? 'it is' : 'they are'}:`,
      products: productHits,
      matched: true,
    }
  }

  if (best) {
    return {
      title: best.entry.title,
      body: best.entry.body,
      href: best.entry.href,
      matched: true,
    }
  }

  return { body: fallback, matched: false }
}
