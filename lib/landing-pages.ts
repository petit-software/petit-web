/**
 * Registry of landing-page slugs. Each slug must have a matching
 * `content/landing/<slug>.md` file. Per-page metadata (title, description,
 * OG image, AEO summary, FAQs) lives in the markdown frontmatter — not here.
 */
export const landingSlugs = [] as const;

export type LandingSlug = (typeof landingSlugs)[number];

export function getLandingSlugs(): readonly string[] {
  return landingSlugs;
}

export function isLandingSlug(slug: string): slug is LandingSlug {
  return (landingSlugs as readonly string[]).includes(slug);
}
