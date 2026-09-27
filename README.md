# petit-web

Marketing site for Petit. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and Framer Motion.

## Run locally

```sh
git clone https://github.com/petit-software/petit-web.git
cd petit-web
npm ci
cp .env.example .env.local   # fill in Resend keys (optional for UI work)
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npx tsc --noEmit` | Type-check the project |

The legacy `npm run lint` script uses `next lint`, which is unavailable in Next.js 16.

## CMRA pages

`/cmra` links to `/cmra/privacy`. The landing page displays a full-page background image; its metadata comes from `content/cmra/index.md`. The privacy page renders `content/cmra/privacy.md` using the existing Markdown renderer. The dedicated routes live in `app/cmra/`; `lib/cmra.ts` loads content and generates metadata. No landing-page registry entry is needed.

Edit `index.md` for landing-page metadata or `privacy.md` for policy content. Keep the `title` and `description` frontmatter, and include one `#` heading in the privacy policy body. The privacy policy contains the supplied draft, including its unresolved `TK` notes. Finalize the Markdown and remove `draft: true` when ready. Draft pages remain accessible but request no indexing and are excluded from the sitemap. Markdown changes take effect on the next build/deployment.

## Deployment

The repository is configured for Netlify in `netlify.toml`: build command `npm run build`, publish directory `.next`, and the Next.js adapter `@netlify/plugin-nextjs`. The build also copies product media into `public/products/` through `prebuild`. API routes and image optimization need the Next.js runtime; this is not a static HTML export.

1. Run `npm ci` and `npm run build` locally. Use `npm start` to inspect the production build.
2. In Netlify, connect `petit-software/petit-web` or open its existing project. Confirm the production branch in Netlify (the local checkout uses `main`; the dashboard configuration is not stored here).
3. Keep the repository root as the base directory and the build/publish settings above. Use a Node version compatible with the installed Next.js version, matching local development.
4. Set `NEXT_PUBLIC_SITE_URL=https://petit.software`. Set `RESEND_API_KEY` for email signups; CMRA pages need no API key. Keep secrets in Netlify environment variables.
5. Review a deploy preview, then merge/push to the configured production branch to trigger deployment if continuous deployment is enabled. Confirm `petit.software` is assigned to the project and DNS is configured in Netlify.
6. Verify `/cmra` and `/cmra/privacy` on the deployed site.

No Netlify project ID, confirmed production branch, or deployment credentials are recorded in this repository. See [Netlify’s Next.js deployment guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) for the adapter and Git connection workflow.

## Resend signup

The email form posts to `/api/email-signup`, which creates a Resend contact via the [Contacts API](https://resend.com/docs/dashboard/contacts/introduction) using the official `resend` SDK. Without an API key it returns a friendly 503, so the UI works for local design work even without keys.

Env vars (see `.env.example`):

```
RESEND_API_KEY=             # full-access key from https://resend.com/api-keys
                            # (sending-only keys return 401 on contacts endpoints)
```

Each landing page configures its own segment via `cta.segmentId` in the markdown frontmatter, so the same `<EmailSignup />` component can drop into multiple pages and route signups to different segments.

## Adding a landing page

1. Add the slug to `landingSlugs` in `lib/landing-pages.ts` — the registry is just a list of slugs.
2. Create `content/landing/<slug>.md` with `seo` + `aeo` + `hero` + `cta` frontmatter and a markdown body. The full reference is in [`content/landing/README.md`](./content/landing/README.md).
3. Drop images into `public/blog/<slug>/` (including a 1200×630 `og.png`). Reference them by bare filename in the MD.
4. Done — the page is live at `/<slug>`.

To route signups to a different Resend segment per page, create the segment at <https://resend.com/segments>, copy its UUID, and paste it into `cta.segmentId`. Omit the field to keep contacts ungrouped.

### SEO + AEO

Each page emits per-page `<meta>` (OG + Twitter + canonical), JSON-LD (`WebPage`, `Article`, and `FAQPage` if you provide `aeo.faqs`), and renders a calm "The short answer" lede directly under the hero from `aeo.summary`. All driven by frontmatter — see the authoring guide for the field list.

### Body layout (full-width, columns, callouts, buttons)

The markdown body supports layout directives — `:::full-width`, `:::wide`, `:::columns` / `:::column` (with `{variant=halves}` and `{variant=thirds}`), `:::callout`, and `::button[Label]` (scrolls to the email form). Full reference in [`content/landing/README.md`](./content/landing/README.md).

### House style

**No emojis in landing-page content.** The brand voice is calm and confident — use words, not glyphs. Enforced by convention; see the authoring guide.

See `CLAUDE.md` for the full architecture, theming rules, and conventions.
