/**
 * The assistant's brain — deliberately not an LLM.
 *
 * It ranks the visitor's question against content 369AI actually published
 * (FAQ answers, service, solution, app and ERP-module copy, and the 75-product
 * catalog) and returns the best matches verbatim. That means it costs nothing
 * to run, needs no API key, answers instantly, and — most importantly for a
 * corporate site — it physically cannot invent a specification or promise a
 * product that does not exist.
 */

export type Entry = {
  id: string
  /** Words that should pull this entry up, beyond those in title/body. */
  keywords?: string[]
  title: string
  body: string
  href?: string
}

/**
 * A product as the matcher sees it. Two token sets rather than one string:
 * the name and its categories identify the product, while descriptions,
 * features and spec values only describe it. A question that names a product
 * must beat one that merely brushes a line of its spec sheet.
 */
export type ProductEntry = {
  name: string
  href: string
  /** Stemmed tokens from the name and categories. */
  label: Set<string>
  /** Stemmed tokens from description, features and spec values. */
  detail: Set<string>
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

/**
 * The two sentences the matcher writes itself rather than quoting. They are
 * passed in already translated: this file is locale-agnostic, and an English
 * sentence inside an Arabic panel is the bug this parameter exists to prevent.
 */
export type AnswerStrings = {
  /** Shown when nothing matched at all, above the WhatsApp hand-off. */
  fallback: string
  /** Introduces a list of product links. Takes the count for its plural. */
  productsFound: (count: number) => string
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

/** Stemmed unique words of some text — the shape both product sets take. */
export function tokenSet(text: string) {
  return new Set(tokenize(text).map(stem))
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
  products: ProductEntry[],
  strings: AnswerStrings
): Answer {
  const tokens = tokenize(query)
  if (!tokens.length) return { body: strings.fallback, matched: false }

  // 1. Best content match (FAQ / service / solution / app / module).
  const ranked = knowledge
    .map((entry) => ({ entry, score: scoreEntry(tokens, entry) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  // 2. Matching products — the visitor may be asking "do you sell X?".
  //    Whole words only: a substring test over spec sheets matches "pos"
  //    inside "position" and floods the list with unrelated hardware.
  const stems = tokens.map(stem)
  const scored = products
    .map((p) => {
      let score = 0
      for (const s of stems) {
        if (p.label.has(s)) score += 3
        else if (p.detail.has(s)) score += 1
      }
      return { p, score }
    })
    // One naming word, or three describing ones. A single word shared with a
    // spec sheet is a coincidence, not a recommendation — at score > 0 an
    // answer about the Attendance app came with a link to a 43-inch kiosk.
    .filter((r) => r.score >= 3)
    .sort((a, b) => b.score - a.score)

  const topProduct = scored[0]?.score ?? 0
  const productHits = scored.slice(0, 5).map((r) => ({ name: r.p.name, href: r.p.href }))

  const best = ranked[0]

  // A confident content match wins — unless a product matched more strongly,
  // which is what happens when the question names one. "Does the 10.1 inch
  // menu display have wifi?" shares only the word "display" with the POS
  // weighing-scale module, and names the product four times over.
  if (best && best.score >= 4 && best.score >= topProduct) {
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
      body: strings.productsFound(productHits.length),
      products: productHits,
      matched: true,
    }
  }

  // A single body word is not an answer. "What is the weather today?" shares
  // only "today" with the FAQ on which platforms the apps run, and quoting
  // that paragraph back reads as a confident non-answer — the WhatsApp
  // hand-off below is the honest reply. Title and keyword hits score 4 and 6,
  // so anything the visitor actually asked about clears this bar.
  if (best && best.score >= 2) {
    return {
      title: best.entry.title,
      body: best.entry.body,
      href: best.entry.href,
      matched: true,
    }
  }

  return { body: strings.fallback, matched: false }
}
