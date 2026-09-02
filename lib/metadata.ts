import type { Metadata } from "next";
import type { LandingFrontmatter } from "./markdown";
import { resolveImagePath } from "./markdown";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://petit.software";

export const SITE_NAME = "Petit";

/** The head's default title. Also the OG/Twitter title for the home page. */
export const SITE_TITLE = "Petit — A boutique AI studio in Zürich";

/** Meta description for the home page, and the fallback for any route that
 *  does not set its own. Drawn from the intro copy in HomeExperience. */
export const SITE_DESCRIPTION =
  "Petit is a boutique AI studio in Zürich building AI agents and automations that pay for themselves — giving small teams the output of a much larger one.";

/** The two lines the intro reveals, reused as the share image's headline so
 *  the unfurl and the page say the same thing. */
export const SITE_TAGLINE = "A boutique AI studio.\nZürich + remote.";

export const SITE_EMAIL = "dev@petit.software";

export const SITE_LOCALITY = "Zürich";
export const SITE_COUNTRY = "CH";

/** Profiles emitted as the Organization's `sameAs`. This is how a search or
 *  answer engine reconciles "Petit" with a real entity, so a wrong URL here is
 *  worse than a missing one — only add a profile that is actually ours.
 *  Empty entries are filtered out, so an unknown handle can just stay blank. */
export const SITE_PROFILES = [
  "https://github.com/petit-software",
  // TODO: confirm and fill in — see the note in the PR/commit.
  // "https://www.linkedin.com/company/…",
  // "https://x.com/…",
].filter(Boolean);

/** The @<handle> for twitter:site / twitter:creator, once it is known. */
export const SITE_TWITTER_HANDLE: string | undefined = undefined;

export function siteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

function absoluteAsset(slug: string, asset: string): string {
  return /^https?:\/\//.test(asset) ? asset : siteUrl(resolveImagePath(slug, asset));
}

export function landingMetadata(args: {
  slug: string;
  frontmatter: LandingFrontmatter;
}): Metadata {
  const { slug, frontmatter } = args;
  const { seo, hero } = frontmatter;
  const url = siteUrl(`/${slug}`);
  const title = seo.title ?? hero.title;
  const description = seo.description;
  const ogImage = absoluteAsset(slug, seo.ogImage);
  const ogAlt = seo.ogImageAlt ?? title;

  return {
    metadataBase: new URL(SITE_URL),
    // Bare — the root layout's title template appends " — Petit".
    title,
    description,
    keywords: seo.keywords,
    authors: seo.author ? [{ name: seo.author }] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...(seo.publishedAt ? { publishedTime: seo.publishedAt } : {}),
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
