# Landing-page authoring guide

Every landing page is one Markdown file in this folder plus a slug entry in `lib/landing-pages.ts`. Each file has two parts:

1. **Frontmatter** — declarative config for SEO, AEO, the Hero, and the CTA.
2. **Body** — the markdown that renders between them, with optional layout directives.

Slugs in the registry are the only ones that build (`dynamicParams = false`), so the registry stays small — just a list of slugs.

---

## Quick start: make a new landing page

Pick a slug — lowercase, hyphenated, URL-safe (e.g. `inbox-zero-for-teams`). Then:

1. **Register the slug** in `lib/landing-pages.ts`:
   ```ts
   export const landingSlugs = [
     "inbox-zero-for-teams",   // ← add yours
   ] as const;
   ```
2. **Create the markdown file** at `content/landing/inbox-zero-for-teams.md`. See the [frontmatter contract](#required-frontmatter) below for the field list.
3. **Make the image folder** at `public/blog/inbox-zero-for-teams/` (the folder name MUST match the slug exactly). Add:
   - `og.png` — 1200×630 share image (required)
   - `hero.png` — the hero image referenced in `hero.image` (optional but recommended)
   - any body images you reference with `![alt](file.png)`
4. **Preview locally** with `npm run dev`, then open <http://localhost:3000/inbox-zero-for-teams>. The dev server picks up edits to the markdown file without a restart.
5. **Ship it** — `npm run build` runs the same validation as CI. If frontmatter is missing required fields the build throws with a clear message naming the slug.

That's the whole flow. Everything else in this document is reference material.

---

## House style

- **No emojis.** Anywhere. Not in body copy, not in headings, not in lists, not in tables, not in callouts, not in CTAs. Use words. The brand voice is calm and confident — emojis undercut both.
- **Sentence case** for headings and CTAs ("Get early access", not "Get Early Access").
- **Concise paragraphs.** Two to three sentences. Lists for parallel ideas.
- **Active voice.** "Petit unifies…" beats "channels can be unified by Petit".

---

## Required frontmatter

Every `.md` file MUST declare these blocks. The build throws if any required field is missing.

```yaml
---
seo:
  title: "Optional override for the meta/OG title"           # optional; defaults to hero.title
  description: "1–2 sentence meta description for search and unfurls."   # REQUIRED
  ogImage: "og.png"                                          # REQUIRED — see below
  ogImageAlt: "Describes what the OG image shows"            # optional; defaults to seo.title
  keywords: ["primary keyword", "another keyword"]           # optional
  publishedAt: "2026-05-29T00:00:00.000Z"                    # optional; populates Article schema
  author: "Petit"                                            # optional; defaults to "Petit"
aeo:
  question: "The primary question this page answers?"        # optional; used in JSON-LD
  summary: "1–3 sentence direct answer. Rendered prominently below the hero AND used as the JSON-LD answer. REQUIRED."
  faqs:                                                      # optional — renders a Q&A section
    - q: "First question?"
      a: "Plain-text answer. No markdown — these get reflected into FAQPage structured data."
    - q: "Second question?"
      a: "Another answer."
hero:
  eyebrow: "optional small label"
  title: "Required headline"                                 # REQUIRED
  subtitle: "optional"
  image: "hero.png"
  imageAlt: "describes image"
cta:
  title: "Required CTA headline"                             # REQUIRED
  subtitle: "optional"
  buttonLabel: "Get notified"
  placeholder: "you@company.com"
  segmentId: "uuid-from-resend"                              # optional
---
```

### SEO

Every page must have its own meta image so unfurls in Slack / LinkedIn / Twitter look intentional. Drop a **1200×630 PNG or JPG** into `public/blog/<slug>/og.png` and reference it by bare filename in `seo.ogImage`. Absolute paths and full URLs are also accepted.

The OG image, canonical URL, OG / Twitter card metadata, and `keywords` meta are all generated from this block at build time.

### AEO (Answer Engine Optimization)

`aeo.summary` is the single most important field for AI search visibility. It is:

- Rendered as a calm "The short answer" lede directly under the hero — the first content an LLM / answer engine encounters.
- Emitted as the `acceptedAnswer` of a `Question` in JSON-LD, so Google AI Overviews, Perplexity, and ChatGPT search can quote it directly.
- Used as the `abstract` of the `Article` schema.

Keep it 1–3 sentences, declarative, and self-contained (don't say "as discussed below").

`aeo.faqs` is optional but high-leverage. Each Q&A renders as a clean list above the CTA AND emits `FAQPage` structured data — the same payload that powers Google's expandable FAQ results and is heavily quoted by AI search.

---

## Body

The body renders inside a centered prose column (`container-md`, ~56rem wide). Standard markdown works out of the box:

- `## Headings`, `### subheadings` (sentence case)
- Paragraphs, **bold**, _italic_, `inline code`
- `- bulleted` and `1. numbered` lists
- `> blockquotes`
- `[links](https://example.com)` — external links auto-open in a new tab
- `![alt](image.png)` — bare filenames resolve to `/public/blog/<slug>/image.png`
- `---` horizontal rules
- Code fences, tables (GFM)

For anything beyond a single prose column, use the **layout directives** below.

---

## Layout directives

Directives use the `:::name` … `:::` container syntax. Buttons use the `::name[Label]` leaf syntax. Attributes go in curly braces: `:::name{variant=tip}`.

### `:::full-width` — edge-to-edge breakout

Stretches edge to edge. Best for hero-sized images and product shots.

```md
:::full-width
![Dashboard overview](dashboard.png)
:::
```

Images inside `:::full-width` automatically drop their rounded frame and use `sizes="100vw"` so the browser fetches a higher-res srcset variant.

### `:::wide` — wider than prose, still padded

```md
:::wide
A wide block of content — diagrams, tables, side-by-side imagery.
:::
```

### `:::columns` — multi-column layout

`:::columns` lays out its children in a grid. Each direct child must be a `:::column`. The default is responsive auto-fit; two variants give you explicit fixed widths.

| Variant                          | Layout                |
| -------------------------------- | --------------------- |
| `::::columns` (no variant)       | auto-fit (1–N cols)   |
| `::::columns{variant=halves}`    | fixed 1/2 + 1/2       |
| `::::columns{variant=thirds}`    | fixed 1/3 + 1/3 + 1/3 |

Both fixed variants collapse to a single column on narrow viewports (under ~40rem).

> **Colon rule (important).** When a container wraps other containers that use the same fence (`:::`), the outer one needs **one more colon**. Because `:::columns` wraps `:::column` blocks, the outer fence must be **four colons** (`::::columns` … `::::`) and each inner `:::column` stays at three. If you use three on both you'll see only the first column inside the grid and the rest spilling below — that's the parser closing the outer block on the first inner `:::`.

```md
::::columns{variant=halves}
:::column
### Before
Five tabs, three logins, two spreadsheets.
:::
:::column
### After
One workspace. Drafts batched, schedules negotiated, replies in one inbox.
:::
::::
```

```md
::::columns{variant=thirds}
:::column
### One calendar
Drag a post across every channel.
:::
:::column
### One inbox
Comments, DMs, and mentions in one queue.
:::
:::column
### One report
A Monday digest you can forward unedited.
:::
::::
```

Columns can hold any markdown — headings, paragraphs, lists, images. Typography is slightly tighter inside columns so multi-up reads cleanly. The same colon rule applies any time you nest containers of the same fence (e.g. a `:::callout` inside `::::columns`).

### `:::callout` — highlighted box

A bordered, accented block for a single key idea. Variants:

- `:::callout` — accent blue (default)
- `:::callout{variant=warn}` — danger red
- `:::callout{variant=note}` — quiet gray

```md
:::callout{variant=tip}
**Tip.** Connect at least two channels during onboarding.
:::
```

### `::button[Label]` — CTA button

Pill-shaped button. **Two colons** — this is a leaf directive (single line, no closing `:::`). Default `href` is `#signup`, which smooth-scrolls to the email form at the bottom.

```md
::button[Get early access]
```

Use as many as the page needs — every one with no `href` lands at the same form.

**Variants** (default is `cta`): `cta`, `primary`, `secondary`, `outline`, `ghost`.

**Custom destination** — external URL or any anchor:

```md
::button[Read the docs]{variant=secondary href=https://docs.petit.so}
::button[Jump to pricing]{variant=ghost href=#pricing}
```

External (`http(s)://…`) links auto-open in a new tab.

### `:::buttons` — multiple buttons in a row

```md
:::buttons
::button[Get early access]
::button[Read the docs]{variant=secondary href=https://docs.petit.so}
:::
```

---

## Cheat sheet

| What you want                                | Use                                                       |
| -------------------------------------------- | --------------------------------------------------------- |
| A normal paragraph or heading                | plain markdown                                            |
| An image in the prose column                 | `![alt](file.png)`                                        |
| An edge-to-edge image or banner              | `:::full-width` … `:::`                                   |
| A wider-than-prose block                     | `:::wide` … `:::`                                         |
| Two columns of equal width (1/2 + 1/2)       | `::::columns{variant=halves}` (4 colons — see colon rule) |
| Three columns of equal width (1/3 × 3)       | `::::columns{variant=thirds}` (4 colons — see colon rule) |
| Responsive auto-fit columns                  | `::::columns` (4 colons — see colon rule)                 |
| Callout / pull quote                         | `:::callout{variant=tip\|warn\|note}`                     |
| Button that scrolls to the signup form       | `::button[Label]`                                         |
| Button with a custom destination             | `::button[Label]{href=https://...}`                       |
| Two or more buttons inline                   | `:::buttons` wrapping multiple `::button[...]`            |

---

## Troubleshooting

**Build error: `Landing page "<slug>" is missing required frontmatter: seo.description, …`**
You forgot a required field. The error names every missing field. Open the markdown file, add them, save, rebuild. Required fields are: `seo.description`, `seo.ogImage`, `aeo.summary`, `hero.title`, `cta.title`.

**404 at `/my-slug` even though the markdown exists**
The slug isn't in `landingSlugs` in `lib/landing-pages.ts`. Only registered slugs build (`dynamicParams = false`).

**404 at `/my-slug` but I registered the slug**
The slug is registered but the markdown file is missing or misnamed. Filename must be `content/landing/<slug>.md` — exact match, lowercase, hyphenated.

**Images render as broken alt text**
The folder under `public/blog/` must match the slug exactly (case-sensitive). A page at `/inbox-zero-for-teams` needs images in `public/blog/inbox-zero-for-teams/`, not `inbox_zero_for_teams` or `InboxZero`.

**Share preview on Slack / LinkedIn shows the wrong image (or none)**
- The file at `public/blog/<slug>/og.png` is missing — drop in a 1200×630 PNG.
- The site is being scraped from a URL that doesn't match `NEXT_PUBLIC_SITE_URL` — set it in `.env.local` to your production origin.
- Slack/LinkedIn cache aggressively. Use their debug tools to re-scrape: <https://www.linkedin.com/post-inspector/> and <https://api.slack.com/reference/messaging/link-unfurling#debugging>.

**The "Get early access" button doesn't scroll**
You're testing in a context where `prefers-reduced-motion` is set; the browser jumps instead of smooth-scrolling, which is correct behavior. The button still navigates to `#signup`.

**Directive syntax doesn't render — shows `:::columns` as literal text**
You used a single colon (`:columns`) instead of three. Container directives need three colons; only `::button[Label]` (a leaf) uses two.

**Columns block shows only the first column inside the grid; the rest spill below as full-width text**
You used three colons (`:::columns`) for the outer wrapper. Because `:::column` children share the same fence, the parser treats the first inner `:::` as the closing fence of the outer block. Use **four** colons on the outer wrapper (`::::columns` … `::::`) and keep three on the inner `:::column`. See the colon rule under [`:::columns`](#columns--multi-column-layout).

---

## Extending

The directive system lives in `components/MarkdownContent/MarkdownContent.tsx`:

- `DIRECTIVE_NAMES` is the allow-list. Add a name to enable it.
- `remarkLandingDirectives` turns each `:::name` into a `<div class="md-name">` (or `md-name md-name--<variant>` if `{variant=…}` is present). `::button` is handled specially and becomes an `<a class="md-button md-button--<variant>">`.
- Styles for each directive live in `components/MarkdownContent/MarkdownContent.module.css` under `/* Markdown layout directives */`, scoped via `.prose :global(.md-…)`.

SEO / AEO plumbing:

- Types and validation: `lib/markdown.ts`
- `<meta>` and `<title>`: `lib/metadata.ts` → `landingMetadata()`
- JSON-LD: `lib/structured-data.ts` → `landingJsonLd()`
- Top-of-page rendering: `components/LandingAnswer/` (the lede), `components/LandingFAQ/` (the Q&A list)

To add a new directive: add its name to `DIRECTIVE_NAMES`, add a `.prose :global(.md-<name>) { … }` rule, and document it here.
