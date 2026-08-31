/**
 * What clients say — the shape of one entry, plus the layout samples.
 *
 * THE RULE: nothing invented is ever published. Real entries live in
 * data/testimonials.json, added by the owner in manage mode from what a
 * customer actually said. Fake reviews are unlawful in the markets we sell
 * into (India's CCPA rules, the UAE, the US FTC) and they mislead the people
 * we are asking to trust us.
 *
 * The SAMPLES below are layout filler for development only. They exist so the
 * wall can be judged at real volume — nine cards, two rows, mixed ratings,
 * the height a real review occupies. Every one renders with a "Layout sample ·
 * not shown live" chip, and lib/testimonials.ts drops them from a production
 * build, so they cannot be published by forgetting.
 *
 * They are NOT drafts to be adopted. Each is written as the BRIEF for the
 * person named: it says what to ask them for. Send them the review link
 * (/?review=1&name=…) and paste back what they write.
 */

export type Product = 'software' | 'hardware' | 'robotics' | 'lockers' | 'erp'

export type Testimonial = {
  id: string
  /** The real person, named as they agreed to be named. */
  name: string
  role?: string
  company?: string
  product: Product
  rating: 1 | 2 | 3 | 4 | 5
  /** Their words, lightly tidied for typos — never rewritten, never invented. */
  quote: string
  /** Hidden from visitors while false; the owner's on/off switch. */
  active?: boolean
  order?: number
  /** Layout filler. Development only, never published. */
  sample?: true
}

export const PRODUCTS: Product[] = ['software', 'hardware', 'robotics', 'lockers', 'erp']

type Draft = Omit<Testimonial, 'active' | 'order' | 'sample'>

/**
 * One placeholder per person the owner listed. The text describes what that
 * card will carry — it is a brief, not an endorsement, and not to be shown as
 * one. Ask each of them; their own words will be better than any of this.
 */
const DRAFTS: Draft[] = [
  {
    id: 'sample-athul',
    name: 'Athul',
    company: 'Company, city',
    product: 'hardware',
    rating: 5,
    quote:
      'Sample card, about as long as a real one runs. This is where Athul describes the POS counter — which shop it runs in, how long it has been there, and what is quicker at the till than before. Replace with his own words.',
  },
  {
    id: 'sample-ajmal',
    name: 'Ajmal',
    company: 'Company, city',
    product: 'hardware',
    rating: 5,
    quote:
      'Sample card. Ajmal on the weighing scale and the VFD customer display: which branch they are in, how long they have run, and what changed at the counter once the customer could read the price themselves.',
  },
  {
    id: 'sample-alshabith',
    name: 'Alshabith',
    company: 'Company, city',
    product: 'software',
    rating: 4,
    quote:
      'Sample card. Alshabith on the restaurant application — tables, orders and kitchen tickets on a busy evening, and which part of the old routine it replaced.',
  },
  {
    id: 'sample-srisaan',
    name: 'Srisaan',
    company: 'Company, city',
    product: 'software',
    rating: 5,
    quote:
      'Sample card. Srisaan on the tools rental management app: how check-out and check-in run now, how the pricing by hour or day works out, and what the paperwork looked like before it.',
  },
  {
    id: 'sample-karthikeyan',
    name: 'Karthikeyan',
    company: 'Company, city',
    product: 'erp',
    rating: 5,
    quote:
      'Sample card. Karthikeyan on server maintenance — how the servers have held up, how quickly problems get picked up, and what that has meant for the working day.',
  },
  {
    id: 'sample-amalesh',
    name: 'Amalesh',
    company: 'Company, city',
    product: 'software',
    rating: 4,
    quote:
      'Sample card. Amalesh on the website: what it needed to do, how the build went, and what has changed since it went live.',
  },
  {
    id: 'sample-nisha',
    name: 'Nisha',
    company: 'Company, city',
    product: 'software',
    rating: 5,
    quote:
      'Sample card. Nisha on the software day to day — which parts she uses most, and what it replaced in the old way of working.',
  },
  {
    id: 'sample-shamnad',
    name: 'Shamnad',
    company: 'Company, city',
    product: 'erp',
    rating: 5,
    quote:
      'Sample card. Shamnad on support: a time something went wrong, how quickly it was answered, and how it was put right.',
  },
  {
    id: 'sample-rajin',
    name: 'Rajin Kumar',
    company: 'Company, city',
    product: 'erp',
    rating: 5,
    quote:
      'Sample card. Rajin Kumar on the WhatsApp and email connection — what now reaches customers automatically, and what used to be sent by hand.',
  },
]

export const SAMPLES: Testimonial[] = DRAFTS.map((draft, index) => ({
  ...draft,
  active: true,
  order: index + 1,
  sample: true,
}))

/** "Athul Krishnan" -> "AK". Initials, because stock faces read as fake. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
