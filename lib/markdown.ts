import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";

export interface HeroFrontmatter {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export interface CTAFrontmatter {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  placeholder?: string;
  segmentId?: string;
}

export interface SEOFrontmatter {
  /** Optional override for the SEO title; defaults to hero.title. */
  title?: string;
  /** Meta description — required. */
  description: string;
  /** Path or URL to the OG / share image — required. Bare filenames resolve under /blog/<slug>/. */
  ogImage: string;
  /** Alt text for the OG image; defaults to the SEO title. */
  ogImageAlt?: string;
  /** Optional list of keywords used in <meta name="keywords">. */
  keywords?: string[];
  /** ISO datetime; populates Article schema datePublished. */
  publishedAt?: string;
  /** Author name; defaults to "Petit" in JSON-LD. */
  author?: string;
}

export interface AEOFaq {
  q: string;
  a: string;
}

export interface AEOFrontmatter {
  /** Primary question this page answers. Falls back to the SEO title in JSON-LD. */
  question?: string;
  /** 1–3 sentence direct answer rendered prominently below the hero — required. */
  summary: string;
  /** Optional Q&A list. Rendered as a FAQ section and emitted as FAQPage JSON-LD. */
  faqs?: AEOFaq[];
}

export interface LandingFrontmatter {
  seo: SEOFrontmatter;
  aeo: AEOFrontmatter;
  hero: HeroFrontmatter;
  cta: CTAFrontmatter;
}

export interface LoadedLanding {
  frontmatter: LandingFrontmatter;
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "landing");

/** Absolute path to a landing page's source file. Exported so the sitemap can
 *  stat it for a real `lastModified` instead of stamping the build time. */
export function landingSourcePath(slug: string): string {
  return path.join(CONTENT_ROOT, `${slug}.md`);
}

export const loadLandingContent = cache(
  async (slug: string): Promise<LoadedLanding | null> => {
    const filePath = path.join(CONTENT_ROOT, `${slug}.md`);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch {
      return null;
    }

    const parsed = matter(raw);
    const data = parsed.data as Partial<LandingFrontmatter>;

    const missing: string[] = [];
    if (!data.hero?.title) missing.push("hero.title");
    if (!data.cta?.title) missing.push("cta.title");
    if (!data.seo?.description) missing.push("seo.description");
    if (!data.seo?.ogImage) missing.push("seo.ogImage");
    if (!data.aeo?.summary) missing.push("aeo.summary");
    if (missing.length) {
      throw new Error(
        `Landing page "${slug}" is missing required frontmatter: ${missing.join(", ")}.`,
      );
    }

    return {
      frontmatter: {
        seo: data.seo as SEOFrontmatter,
        aeo: data.aeo as AEOFrontmatter,
        hero: data.hero as HeroFrontmatter,
        cta: data.cta as CTAFrontmatter,
      },
      body: parsed.content,
    };
  },
);

export function resolveImagePath(slug: string, src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `/blog/${slug}/${src.replace(/^\.\//, "")}`;
}
