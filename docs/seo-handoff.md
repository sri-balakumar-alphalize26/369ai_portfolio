# 369ai.biz — SEO session handoff

**Date of session:** 12 September 2026
**Site:** https://369ai.biz — Next.js 16 on Ubuntu, behind Cloudflare
**Repo:** `C:\Projects\369ai_portfolio`

---

## 1. Where things stand

### Code — finished, nothing more to write

| Commit | What it did |
|---|---|
| `c94d26c` | sitemap.xml (87 URLs, 9 locales + x-default), robots.txt, OG/Twitter share card, Organization + LocalBusiness JSON-LD, x-default hreflang, and **canonical tags on 5 pages that were wrongly claiming to be the homepage** |
| `e51d5b7` | Brand name variants (`369 AI`, `369AIbiz`, `369ai.biz`) + the `@369AIbiz` YouTube channel added to `sameAs` |
| `395d03c` | The four "Learn more" links now name their destination. SEO 85 → 92 |
| `4278189` | Product + Offer + BreadcrumbList on all 75 product pages, ItemList on the shop listing |
| `af0c1a5` | **Deleted `app/[locale]/loading.tsx`.** CLS 0.421 → 0.002, Performance 47 → 91 |
| `a965612` | `localeCookie: false` in `i18n/routing.ts` — stops the NEXT_LOCALE cookie that was blocking Cloudflare caching |

### Repos

| Remote | Repo | Commit |
|---|---|---|
| `origin` | `Sri-balakumar/369ai_portfolio` (private) | `a965612` |
| `origin2` | `sri-balakumar-alphalize26/369ai_portfolio` | `a965612` |
| `origin3` | `sri-balakumar-alphalize26/369ai_portfolio_live` | **`af0c1a5`** — one behind |

**Rule: push `origin` and `origin2` freely. `origin3` is the LIVE site — only on explicit instruction.**

### Cloudflare — done

- HTTP → HTTPS redirect: **301** ✓
- www → apex redirect: **301** ✓
- Cache rule (`https://369ai.biz/*`, Eligible for cache): deployed ✓
  *(still reporting BYPASS until `a965612` is deployed — see step 1 below)*

### Google Search Console — done

- Domain property for `369ai.biz`, DNS-verified (no HTML tag needed)
- Sitemap `https://369ai.biz/sitemap.xml` submitted, status **Success**
- Indexing requested for: `/en/events`, `/en/ceo`, `/en/about`, `/en/products`, `/en/solutions`, `/en/apps`

---

## 2. The four things still to do

### Step 1 — Push the live repo (blocked on your credentials)

My shell can't answer the login popup. Run this yourself:

```powershell
cd C:\Projects\369ai_portfolio
git push origin3 main
```

A dialog appears — sign in as **`sri-balakumar-alphalize26`**.
Expected output: `af0c1a5..a965612  main -> main`

If it fails with 403, the token doesn't cover that repo. Go to
https://github.com/settings/tokens and either use a **classic** token with the
`repo` scope, or edit the fine-grained one and add `369ai_portfolio_live` under
Repository access.

### Step 2 — Rebuild the Ubuntu server

```bash
sudo 369ai-deploy
```

Takes a few minutes (~800 pages across 9 locales).

If that script doesn't exist:

```bash
sudo -u i369ai bash -c '
  set -a; . /etc/369ai/369ai.env; set +a
  cd /srv/369ai
  git fetch --all && git reset --hard origin/main
  npm ci
  NODE_OPTIONS=--max-old-space-size=4096 npm run build
'
sudo systemctl restart 369ai
```

Check the server pulls the right repo first:
```bash
sudo -u i369ai git -C /srv/369ai remote -v
```
It must point at **`369ai_portfolio_live`**.

**Verify afterwards** — this is the one that should change:
```bash
curl -sI https://369ai.biz/en/about | grep -i "cf-cache\|set-cookie"
```
Expect: **no** `Set-Cookie` line, and `cf-cache-status: HIT` on a second request.
`/en` stays `BYPASS` — that is correct, it checks the manage-mode login.

### Step 3 — YouTube link (2 minutes)

studio.youtube.com → **Customisation** → **Basic info** → **Links** → add
`https://369ai.biz`

The `@369AIbiz` channel is currently the **#1 Google result for your brand name**
and links nowhere. It is the cheapest real backlink available, and it pairs with
the `sameAs` entry already in the site's code so each names the other.

### Step 4 — In 2–3 days: check indexing

**a) Google search:**
```
site:369ai.biz
```
- Some results → **it's working.** Indexing has begun.
- Still nothing after 5–7 days → send me a screenshot of Search Console → Pages.

**b) Search Console → Indexing → Pages**
Screenshot it and send to me. I'll read it for errors. What you want to see is
the "Indexed" count climbing toward 87.

**c) Search Console → Sitemaps**
Should show 87 discovered URLs.

---

## 3. Things worth knowing (hard-won in this session)

**The CLS cause was `loading.tsx`.** The home page reads a cookie, so Next.js
streamed it: a 60vh placeholder painted, the footer landed under it, then the
real content arrived and threw the footer down the page. That single shift was
0.4198 of the 0.421 total. Safe to delete because `RouteLoader` already shows a
loading overlay through a portal — portals can't move layout.

**The splash loader in `layout.tsx` is innocent — do not remove it.** Tested by
removing it: CLS barely moved (0.421 → 0.400) and FCP got *worse* by a full
second (0.5s → 1.5s). It paints instantly from inline HTML.

**Product pages carry no price.** Product schema is otherwise complete, so the
day prices are added to `content/products.json`, merchant rich results (price +
availability in search) become available with one small addition.

**Git credentials:** both remotes carry their account name in the URL
(`https://Sri-balakumar@github.com/...`). That is load-bearing — without it git
authenticates as the wrong account and returns 403. `credential.useHttpPath` is
`true`, so each repo path stores its own credential.

**The robots.txt "invalid" warning is Cloudflare's,** not yours — it injects a
`Content-Signal:` directive Lighthouse doesn't recognise. Google ignores unknown
directives. Your own rules sit correctly below it.

---

## 4. Honest expectations

**"369" alone is not winnable and not worth wanting.** People searching it want
the 369 manifestation method or the angel number. That traffic would never buy
anything, and chasing it would hurt the terms you actually want.

**"369 ai" is contested** by at least six companies — 369ai.cloud, 369 AI
Ventures, 369 Studio, 369 Solutions, 369 AI Consulting, AI META 369. Page one is
realistic over time; being alone at the top is not, for anyone.

**Realistic targets:** own `369aibiz` and `369 ai biz`, page one for `369 ai`,
and — the genuinely winnable prize — **the 75 product model codes** like
`NGP-MC720-S`. Low competition, real buying intent, and those pages now have
full Product structured data.

**Timeline:** first pages usually appear within days of requesting indexing;
most of the 87 within 1–2 weeks. Google will not show your site above
369ai.cloud immediately — that's an established domain with history.

---

## 5. The real ceiling, when you're ready for it

**Product descriptions are English on all 9 language versions.**
`content/products.json` holds one English name and description per product; only
the menus and labels are translated. So `/ta/shop/...` is a Tamil shell around
English text, and Google folds those pages rather than ranking them separately.

Your 675 product URLs are really **75 pages of value**.

Fixing it means translating 75 products × 8 languages. That is a content
project, not a code one — and it is the single largest remaining SEO
opportunity for this site.

---

## 6. Deliberately not done

| Item | Why |
|---|---|
| Accessibility (score 79) | Zero ranking impact, and the fixes change how the site looks |
| Performance 91 → 95 | ~90ms from re-encoding images. All five Core Web Vitals already pass |
| FAQ schema | Google restricted FAQ rich results in 2023 to government/health sites |
| Google Business Profile | Worth doing — 6 real offices. Often beats organic ranking for a brand search. business.google.com |

---

## Quick resume prompt

> Read `369ai-seo-handoff.md`. I've done steps 1–3. Here's my Search Console
> Pages screenshot — what's next?
