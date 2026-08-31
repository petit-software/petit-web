# Petit Web — Project Guide

Marketing site for Petit. The codebase is built around a **landing-page template system**: each landing page is a markdown file declared in a registry and rendered through a single template route.

## Stack

- **Next.js 15** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (radix base, `nova` style) for all UI
- **next-themes** for light/dark mode (mounts `.dark` on `<html>`)
- **Framer Motion** (`framer-motion`) for hero entry animations
- **gray-matter** + **react-markdown** + **remark-gfm** + **remark-directive** for landing-page content
- **@tailwindcss/typography** for prose styling in markdown bodies
- **next/image** for managed images
- **Resend** (`resend` SDK) for email signups
- **Netlify** deployment via `@netlify/plugin-nextjs`
- **npm** package manager

## File structure

```
/
├─ app/
│  ├─ layout.tsx                     # wraps body in next-themes ThemeProvider
│  ├─ page.tsx                       # delegates to (site)/temp
│  ├─ globals.css                    # Tailwind v4 + shadcn theme + Die Grotesk @font-face
│  ├─ [slug]/page.tsx                # catch-all landing route
│  ├─ (site)/                        # non-landing routes
│  └─ api/
│     └─ email-signup/route.ts       # Resend Contacts API
├─ components/
│  ├─ ui/                            # shadcn primitives (DO NOT hand-edit unless necessary)
│  ├─ ThemeProvider.tsx              # next-themes wrapper (client)
│  ├─ ThemeToggle/                   # DropdownMenu + sun/moon icons
│  ├─ Logo/                          # animated SVG (kept custom)
│  ├─ LogoMark/                      # static SVG mark (kept custom)
│  ├─ LandingPageTemplate/           # composes Hero + Answer + Body + FAQ + CTA
│  ├─ LandingHero/                   # frontmatter-driven hero with Framer Motion fade-up
│  ├─ LandingAnswer/                 # shadcn Alert wrapping aeo.summary
│  ├─ LandingFAQ/                    # shadcn Accordion over aeo.faqs
│  ├─ LandingCTA/                    # shadcn Card wrapping EmailSignup
│  ├─ LandingHeader/                 # header with LogoMark + ThemeToggle
│  ├─ MarkdownContent/               # body renderer; maps directives to shadcn primitives
│  └─ EmailSignup/                   # client form: Field + InputGroup + InputGroupButton
├─ lib/
│  ├─ utils.ts                       # shadcn cn() helper
│  ├─ landing-pages.ts               # registry of landing slugs
│  ├─ markdown.ts                    # loader + frontmatter types + image-path resolver
│  ├─ metadata.ts                    # Next Metadata helpers
│  └─ structured-data.ts             # JSON-LD generation
├─ content/
│  ├─ landing/<slug>.md              # one file per landing page
│  └─ products/<slug>/               # one folder per product (ticker tile)
│     ├─ index.md                    # frontmatter + long-form body
│     └─ cover.png|jpg|webp|...      # optional, auto-detected by filename
├─ public/
│  ├─ fonts/                         # Die Grotesk A woff2 files
│  ├─ blog/<slug>/                   # per-landing-page image folder
│  └─ products/<slug>/               # generated — mirrored from content/products at build/dev time, gitignored
├─ components.json                   # shadcn config
├─ postcss.config.mjs
└─ package.json
```

## Adding a new landing page

1. Add the slug to `landingSlugs` in `lib/landing-pages.ts` — the registry is just a slug list. Per-page metadata lives in markdown frontmatter.
2. Create `content/landing/my-new-page.md` with the full frontmatter contract (`seo`, `aeo`, `hero`, `cta`). See `content/landing/README.md` for the authoring guide.
3. Drop images into `public/blog/my-new-page/` (including a 1200×630 `og.png`) and reference them in the MD by bare filename.
4. Done — the page is live at `/my-new-page`.

Only slugs in the registry are built (`dynamicParams = false`).

## Adding a new product

Products (the tiles in the home page's `ProductTicker`) are auto-discovered — there's no registry to edit.

1. Create `content/products/<slug>/index.md` with frontmatter `name`, `description`, `url` (all required), and optional `imageAlt`. Body markdown becomes the long-form text shown in the product's modal.
2. Name the tile media `cover.<ext>` (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, or `.avif`) and drop it directly in that same folder — no frontmatter field needed, `lib/products.ts` auto-detects it by filename, copies it to `public/products/<slug>/`, and rewrites the path. Don't add images to `public/` by hand.
3. Either file may be a short video instead of a still — `cover.mp4` / `detail.webm` / `.mov` are picked up the same way, and render as a muted, looping, `playsInline` clip. The ticker's invisible sizing copy and viewers with `prefers-reduced-motion` get `preload="none"` and no autoplay.
4. Optionally add `detail.<ext>` alongside it — the wider image shown in the drawer. Same auto-detection; falls back to `cover.<ext>` when absent. Use it when the tile wants a square icon but the drawer wants a full-bleed shot.
5. Optionally add `coverFit: cover` to make the cover fill its tile box and crop, instead of the default `contain`, which shows the whole frame. Worth setting when the cover's aspect does not match the tile's — a 16:9 clip letterboxes inside the square box big desktops use, and fills under `cover`. Any value other than `cover`/`contain` throws at build.
6. Optionally add `tag: Some Label` to the frontmatter for a short badge in the tile's top-right corner. Colour is keyed off the label in `TAG_CLASSES` (`components/ProductCard/ProductCard.tsx`): `Partnership` is purple, `Client Work` is green, `Experiment` is amber, and anything else — `Open-Source` included — falls back to the neutral `secondary` badge. The chromatic pairs are the `--tag-*` tokens in `globals.css`, defined for light and dark; add a token pair plus a `TAG_CLASSES` entry to introduce another colour. Omit the field and no badge appears.
7. Optionally add `github: owner/repo` to the frontmatter for an open-source product. It swaps the drawer's single "Visit product" button for a **Download** + **GitHub** pair; Download points at `/api/download/<slug>`, which resolves the newest release asset at request time (see below).
8. That's it — `getProducts()` reads every folder under `content/products/`, sorted alphabetically by slug, and the ticker picks it up on the next dev reload or build. No slug list, no import to add.

`public/products/` is gitignored — it's a generated mirror of `content/products/<slug>/*`, not a source of truth. `scripts/sync-product-images.mjs` (run from `predev` / `prebuild`) does the copying.

### Latest-release downloads

`app/api/download/[slug]/route.ts` 302-redirects to the newest release asset for a product's repo. GitHub's static `/releases/latest/download/<file>` shortcut only works when the asset filename is stable across releases; Clio's assets embed the version (`Clio-0.61.dmg`), so the asset is resolved through the GitHub API at request time instead, cached for 5 minutes via `next: { revalidate }`.

The repo comes from the product's own `github` frontmatter, looked up by slug — never from the URL — so the route can't be pointed at an arbitrary host. It prefers `.dmg`, then `.pkg`, then `.zip`, then the first asset, and falls back to the repo's releases page if the API call fails.

## Markdown frontmatter contract

Every landing-page `.md` file MUST include `seo` (description + ogImage), `aeo` (summary), `hero` (title), and `cta` (title). Build throws if any required field is missing. See `content/landing/README.md` for the canonical reference; the abbreviated contract:

```yaml
---
seo:
  title: "Optional override; defaults to hero.title"
  description: "1–2 sentence meta description."          # REQUIRED
  ogImage: "og.png"                                       # REQUIRED — 1200x630 in /blog/<slug>/
  ogImageAlt: "Describes the OG image"
  keywords: ["primary keyword", "another"]
  publishedAt: "2026-05-29T00:00:00.000Z"
  author: "Petit"
aeo:
  question: "The primary question this page answers?"
  summary: "1–3 sentence direct answer."                  # REQUIRED — rendered + emitted as JSON-LD
  faqs:
    - q: "First question?"
      a: "Plain-text answer."
hero:
  eyebrow: "optional small label"
  title: "Required headline"
  subtitle: "optional"
  image: "hero.png"           # resolved against /blog/<slug>/
  imageAlt: "describes image"
cta:
  title: "Required CTA headline"
  subtitle: "optional"
  buttonLabel: "Get notified"
  placeholder: "you@company.com"
  segmentId: "uuid-from-resend"
---

Body markdown goes here. Images use bare filenames:
![alt](some-image.png)
```

## SEO + AEO

Each landing page is SEO- and AEO-ready out of the box:

- **Meta + OG + Twitter** come from `seo.*` via `lib/metadata.ts` (`landingMetadata()`).
- **JSON-LD** (`@graph` with `WebPage` + `Article` + optional `FAQPage`) is built in `lib/structured-data.ts` (`landingJsonLd()`) and injected from `app/[slug]/page.tsx` as `<script type="application/ld+json">`.
- **`LandingAnswer`** renders `aeo.summary` inside a shadcn `Alert` — first content an answer engine encounters.
- **`LandingFAQ`** renders `aeo.faqs` (if present) as a shadcn `Accordion`, mirroring the `FAQPage` structured data for human readers.

## House style

**No emojis in landing-page content.** Body, headings, lists, tables, callouts, CTAs — all text. Brand voice is calm and confident; emojis undercut it. This rule is documented in `content/landing/README.md` and applies to any new landing-page content.

## Image path resolution

Inside `content/landing/<slug>.md` and in the `hero.image` frontmatter:

- bare filename (`hero.png`) → resolves to `/blog/<slug>/hero.png`
- absolute path (`/anything`) → used verbatim
- full URL (`https://...`) → used verbatim

Image folder MUST match the slug exactly: `public/blog/<slug>/`.

## Body layout directives

The markdown body supports container directives (via `remark-directive`) that map to shadcn primitives or Tailwind utility classes inside `components/MarkdownContent/MarkdownContent.tsx`:

| Directive | Output |
| --- | --- |
| `:::full-width` | Negative-margin breakout `<div>` that escapes the prose column. |
| `:::wide` | Wider container with padding (for tables, diagrams). |
| `:::columns{variant=halves\|thirds}` + `:::column` | Responsive Tailwind grid. |
| `:::callout{variant=tip\|warn\|note}` | shadcn `<Alert>` with a Lucide icon (`Lightbulb` / `AlertTriangle` / `Info`). |
| `::button[Label]{variant=… href=…}` | shadcn `<Button asChild>` wrapping an `<a>`. Default `href` is `#signup`. Variants: `default` / `cta` / `primary` (→ default), `secondary`, `outline`, `ghost`, `warn` (→ destructive), `link`. |
| `:::buttons` | Flex-wrap group for inline buttons. |

The directive parser emits `data-md-directive` / `data-md-button` data attributes on the underlying HTML, and the React component overrides in `MarkdownContent.tsx` look at those to swap in the right shadcn primitive.

## Resend signup

`/api/email-signup` creates a Resend contact via the official `resend` SDK (`resend.contacts.create({ email, segments })`). Audiences are deprecated in Resend — contacts are global and grouped via segments for broadcast targeting. Duplicate emails are treated as success (the SDK returns an "already exists" error which the route swallows). The route logs `source` (the landing slug) server-side.

**Per-form segments**: each landing page declares its own `cta.segmentId` in frontmatter. `<EmailSignup />` posts that segment ID to `/api/email-signup`, which adds the new contact to it. This lets the same component drop into multiple pages with different downstream segments. The segment ID is sent from the client — trusted because the worst case (someone POSTing a different segment ID) just shuffles signups between segments on the same Resend account.

Env vars:

- `RESEND_API_KEY` — required. Must be a **full-access** key; sending-only keys return 401 `restricted_api_key`.

The SDK returns `{ data, error }` and never throws on API errors — this route checks `error` explicitly (gotcha #5 from the Resend skill). The form returns a 503 with a friendly message when the API key is missing, so local dev works without keys.

## Theming (light + dark)

- **Tokens** live in `app/globals.css`: shadcn defines semantic OKLCH color tokens on `:root` (light) and `.dark` (dark) blocks, surfaced through Tailwind v4's `@theme inline` so `bg-background`, `text-foreground`, `text-muted-foreground`, etc. resolve correctly.
- **No-flash + persistence** are handled by `next-themes` (mounted in `app/layout.tsx` via `components/ThemeProvider.tsx`). It mounts `.dark` on `<html>` before paint and persists the user's choice in `localStorage`.
- **Toggle**: `components/ThemeToggle/` is a `DropdownMenu` with Light / Dark / System options. Mounted by `LandingHeader`.
- **Component rule**: never hardcode raw colors. Always use shadcn semantic tokens (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border`, `ring`, `bg-destructive`). Layout overrides via `className` are fine; styling overrides on shadcn components are not.

## Design system

shadcn/ui is the source of truth for look-and-feel. All visual primitives (Button, Input, Field, Card, Alert, Accordion, DropdownMenu, etc.) live under `components/ui/` and are added through `npx shadcn@latest add`. Custom CSS Modules and the legacy `app/colors.css` / `spacing.css` / `radius.css` / `typography.css` / `motion.css` files have been deleted; do not reintroduce them.

- **Typography**: `Die Grotesk A` is registered via `@font-face` in `globals.css` and bound to `--font-sans` on `:root`. shadcn's `font-sans` class picks it up automatically.
- **Colors / radii / spacing**: use Tailwind utility classes with shadcn semantic tokens. Never hardcode raw values like `bg-blue-500`.
- **Motion**: Framer Motion is still allowed for hero entry animations and one-off effects, but micro-interactions (hover, focus, disabled) are handled by shadcn defaults.

## Conventions

- **Server Components by default**; opt into Client only for state, animation, or browser APIs (`LandingHero`, `EmailSignup`, `ThemeToggle`, `ThemeProvider`, shadcn components that need `"use client"`).
- **One folder per app component**: `Component.tsx` + `index.ts`. No `.module.css` files — styling is Tailwind utility classes only.
- **Import via aliases**: `@/components/ui/...` for shadcn primitives, `@/components/...` for app components, `@/lib/...` for utilities.
- **Always use shadcn primitives** if one exists for the job (Button, Alert, Card, Accordion, DropdownMenu, Field, InputGroup, etc.). Compose, don't reinvent.
- **`className` for layout, not styling**. Never override a shadcn component's colors, typography, or borders — pick the right variant instead.
- **Use semantic shadcn tokens** (`bg-background`, `text-muted-foreground`) and never raw Tailwind colors (`bg-blue-500`).
- **No `space-y-*` / `space-x-*`** — use `flex flex-col gap-*` or `grid gap-*`.
- **Use `size-*` when width and height are equal** — `size-10`, not `w-10 h-10`.
- **Use `cn()` from `@/lib/utils`** for conditional classes, not manual template literals.
- **Respect `prefers-reduced-motion`**: `useReducedMotion()` in Framer Motion components.
- **Semicolons, accessible focus rings, keyboard-friendly forms.**
- **Add new abstractions only when logic repeats 3+ times.**

## Run

```
npm install
npm run dev
```

Build:
```
npm run build
```

## Adding more shadcn components

```
npx shadcn@latest add <component>
```

See `npx shadcn@latest search` to find what exists, and the [shadcn docs](https://ui.shadcn.com/docs/components) for usage.
