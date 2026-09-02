# Meta tags reference

Everything the site puts in `<head>`, where it comes from, and what is worth
adding next. Written against the Next 16 App Router Metadata API — there is no
SEO package in this project and there does not need to be one.

## Where metadata comes from

| Source | File | Applies to |
| --- | --- | --- |
| Sitewide defaults | `app/layout.tsx` (`metadata`, `viewport`) | every route, unless the route overrides |
| Site constants | `lib/metadata.ts` | the values those defaults are built from |
| Home page | `app/page.tsx` | `/` — canonical plus the sitewide JSON-LD graph |
| Landing pages | `lib/metadata.ts` → `landingMetadata()`, fed by frontmatter | `/[slug]` |
| Share image | `app/opengraph-image.png` + `.alt.txt` | the default OG/Twitter image, inherited by any route without its own |
| Icons | `app/icon.png`, `app/apple-icon.tsx` | every route |
| Structured data | `lib/structured-data.ts` | `siteJsonLd()` on `/`, `landingJsonLd()` on `/[slug]` |
| Crawl directives | `app/robots.ts` | `/robots.txt` |
| URL inventory | `app/sitemap.ts` | `/sitemap.xml` |
| Answer-engine index | `app/llms.txt/route.ts` | `/llms.txt` |
| Markdown page versions | `app/markdown/[slug]/route.ts` + a rewrite in `next.config.ts` | `/index.md`, `/<slug>.md` |

Two rules the layout depends on:

- **Never put `alternates.canonical` in the root layout.** A canonical set there
  is inherited by every child that omits one, which would point the whole site
  at `/`. Canonicals belong on the page.
- **Page titles are bare.** The root layout owns the ` — Petit` suffix through
  `title.template`, so `landingMetadata()` returns the headline alone. Adding
  the suffix in both places produces `… — Petit — Petit`.

## What the home page emits today

Verified against the built HTML (`.next/server/app/index.html`).

### Core

| Tag | Value | Set in |
| --- | --- | --- |
| `<title>` | Petit — A boutique AI studio in Zürich | `SITE_TITLE` |
| `description` | The 150-character studio summary | `SITE_DESCRIPTION` |
| `keywords` | AI studio, AI agents, AI automation, … | root layout |
| `canonical` | `https://petit.software` | `app/page.tsx` |
| `robots` | `index, follow` | root layout |
| `googlebot` | `index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1` | root layout |
| `theme-color` | `#ffffff` light / `#000000` dark | root `viewport` |
| `<html lang>` | `en` | root layout |

`max-image-preview:large` is what lets the share image run full width in a
result; `max-snippet:-1` lifts the cap on how much of the page an answer engine
may quote back. Both matter more for AEO than any og: tag does.

### Open Graph

`og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type`,
and `og:image` with `:type`, `:width`, `:height` and `:alt`. The image is
authored artwork at `app/opengraph-image.png` (1200×628 — the standard OG
ratio), with its alt text alongside it in `opengraph-image.alt.txt`. Replacing
the card is a matter of dropping in a new PNG at that path; nothing in code
refers to its contents.

### Twitter

`twitter:card` (`summary_large_image`), `title`, `description`, `image` with
`:alt`, `:type`, `:width`, `:height`. `twitter:site` and `twitter:creator` are
wired but dormant — they appear as soon as `SITE_TWITTER_HANDLE` in
`lib/metadata.ts` is given a handle.

### Icons

`icon` (`app/icon.png`, 256×256) and `apple-touch-icon` (180×180). The touch
icon is generated rather than shipped as a file: iOS flattens transparency to
black, and the mark is near-black, so `app/apple-icon.tsx` composites the same
PNG onto a light ground instead of letting it vanish.

The favicon is a dark mark on transparency, so it disappears against a dark
browser tab bar. A light-on-dark variant, swapped by `prefers-color-scheme`,
is the fix if that turns out to matter.

### Structured data

One `application/ld+json` block on `/` holding `Organization` (name, url, logo,
email, Zürich address, `sameAs`) and `WebSite`, joined by stable `@id`s so other
pages can reference the one Organization instead of describing a new one.

## Tags deliberately not set

| Tag | Why |
| --- | --- |
| `article:*` | Only meaningful on the landing template, where `openGraph.publishedTime` already covers it. |
| `og:locale:alternate` | The site is English-only. Add with `alternates.languages` if that changes. |
| `author` meta | Landing pages set `authors` from frontmatter; the home page is the Organization, not a person. |
| `viewport` | Next emits a correct default; overriding it is how zoom gets broken. |
| `msapplication-*`, `X-UA-Compatible` | Dead tags for dead browsers. |
| `revisit-after`, `rating`, `distribution`, `copyright` | No engine has read these in twenty years. |
| `SearchAction` in JSON-LD | The site has no search. Claiming one is a structured-data error. |
| `dc.*` / Dublin Core | Nothing consuming it. |

## Worth adding next

Ordered by payoff, none of them home-page work:

1. **A canonical on `/clarity`.** It is the one indexable route still without
   one.
2. **Search Console + Bing verification.** `metadata.verification.google` /
   `.other` once the properties exist.
3. **Per-product pages.** `/products/<slug>` with `SoftwareApplication` schema.
   Every product's long-form copy lives inside a drawer that only mounts on
   click, so no crawler sees it in the HTML — `/index.md` is currently the only
   place that copy is served, and a real page would do it properly.
4. **An `<h1>` on the home page.** `TitleReveal` renders the headline as
   `<div>`s, so the strongest on-page signal a home page has is absent.
5. **`dateModified` in `landingJsonLd()`** is `new Date()`, i.e. build time. It
   claims every page was modified on every deploy. Use the file's mtime or a
   frontmatter field.

## llms.txt

`/llms.txt` follows the <https://llmstxt.org/> format: an H1 name, a blockquote
summary, prose sections carrying no headings, then H2 file lists whose entries
are `[name](url): notes`, with `Optional` last for links an agent may skip.

It is generated from the product folders and the landing registry, so a new
product appears in it the same way it appears in the ticker. Entries for our own
pages point at their markdown versions, which is the companion recommendation in
that spec — "pages with information that agents might need provide a clean
markdown version of those pages at the same URL as the original page".

`/clarity` has no markdown version: its copy lives in TSX, and duplicating it
into a second source would only rot. It gets one for free if it ever moves to
the landing template.

## Checklist for a new page

- [ ] `export const metadata` with `title` (bare — no ` — Petit`) and `description`
- [ ] `alternates: { canonical: "/the-path" }`
- [ ] Its own `openGraph.images`, or let it inherit the generated site card
- [ ] `robots: { index: false }` if it duplicates another route
- [ ] JSON-LD referencing `ORGANIZATION_ID()` rather than redefining the Organization
- [ ] Exactly one `<h1>`

## Verifying

- Built HTML: `npm run build`, then read `.next/server/app/<route>.html`
- Rich results: <https://search.google.com/test/rich-results>
- Schema: <https://validator.schema.org/>
- Unfurls: <https://www.linkedin.com/post-inspector/>, <https://cards-dev.twitter.com/validator>
- The share card itself: `/opengraph-image.png`
- Crawl surface: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/index.md`

`app/sitemap.ts` takes each `lastModified` from the mtime of the file that
produces the page, so the field stays honest across deploys. Google ignores
`changeFrequency` and `priority`, which is why neither is emitted.

`NEXT_PUBLIC_SITE_URL` must be set in the Netlify environment. Without it every
canonical, `og:url` and JSON-LD `@id` falls back to the literal in
`lib/metadata.ts`.
