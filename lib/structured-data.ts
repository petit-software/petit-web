import type { LandingFrontmatter } from "./markdown";
import { resolveImagePath } from "./markdown";
import {
  SITE_COUNTRY,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOCALITY,
  SITE_NAME,
  SITE_PROFILES,
  SITE_TITLE,
  siteUrl,
} from "./metadata";

type JsonLdNode = Record<string, unknown>;

function absoluteAsset(slug: string, asset: string): string {
  return /^https?:\/\//.test(asset) ? asset : siteUrl(resolveImagePath(slug, asset));
}

export function landingJsonLd(args: {
  slug: string;
  frontmatter: LandingFrontmatter;
}): JsonLdNode {
  const { slug, frontmatter } = args;
  const { seo, aeo, hero } = frontmatter;
  const url = siteUrl(`/${slug}`);
  const title = seo.title ?? hero.title;
  const image = absoluteAsset(slug, seo.ogImage);
  const author = seo.author ?? "Petit";

  const graph: JsonLdNode[] = [
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: title,
      description: seo.description,
      primaryImageOfPage: { "@type": "ImageObject", url: image },
      ...(aeo.question
        ? {
            mainEntity: {
              "@type": "Question",
              name: aeo.question,
              acceptedAnswer: { "@type": "Answer", text: aeo.summary },
            },
          }
        : {}),
    },
    {
      "@type": "Article",
      headline: title,
      description: seo.description,
      image: [image],
      ...(seo.publishedAt ? { datePublished: seo.publishedAt } : {}),
      dateModified: new Date().toISOString(),
      author: { "@type": "Organization", name: author },
      publisher: { "@type": "Organization", name: "Petit" },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      abstract: aeo.summary,
    },
  ];

  if (aeo.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: aeo.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/** Fragment identifiers for the sitewide nodes, so any page's graph can point
 *  at the one Organization rather than describing a new one each time. */
export const ORGANIZATION_ID = () => siteUrl("#organization");
export const WEBSITE_ID = () => siteUrl("#website");

/**
 * The sitewide entity graph, emitted on the home page. `Organization` is what
 * a search or answer engine resolves "Petit" against; `WebSite` binds the
 * domain to it. Both carry stable @ids so other pages can reference them
 * instead of repeating themselves.
 */
export function siteJsonLd(): JsonLdNode {
  const url = siteUrl();
  const organizationId = ORGANIZATION_ID();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        email: SITE_EMAIL,
        logo: {
          "@type": "ImageObject",
          url: siteUrl("/images/logo.svg"),
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE_LOCALITY,
          addressCountry: SITE_COUNTRY,
        },
        ...(SITE_PROFILES.length ? { sameAs: SITE_PROFILES } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID(),
        url,
        name: SITE_NAME,
        alternateName: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
    ],
  };
}
