/**
 * FAQ category structure — the single source for both the home-page Faq
 * component (sidebar + accordion) and the assistant's knowledge index.
 * Copy lives in the `faq.cats.<key>` namespace of the message catalogs;
 * `count` is how many q/a pairs that category holds.
 */
export const FAQ_CATS = [
  { key: 'general', count: 5 },
  { key: 'apps', count: 5 },
  { key: 'desktop', count: 4 },
  { key: 'erp', count: 4 },
  { key: 'hardware', count: 4 },
  { key: 'pricing', count: 4 },
] as const

export type FaqCatKey = (typeof FAQ_CATS)[number]['key']
