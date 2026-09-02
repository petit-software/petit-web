import { getLandingSlugs, isLandingSlug } from "@/lib/landing-pages";
import { loadLandingContent, resolveImagePath } from "@/lib/markdown";
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, siteUrl } from "@/lib/metadata";
import { getProducts } from "@/lib/products";

export const dynamic = "force-static";
export const dynamicParams = false;

/**
 * Clean markdown versions of the site's pages, which llms.txt asks for:
 * "pages with information that agents might need provide a clean markdown
 * version of those pages at the same URL as the original page."
 *
 * The public URLs are `/index.md` and `/<slug>.md` — next.config.ts rewrites
 * them here, because a Next segment cannot be a dynamic param with a literal
 * `.md` suffix. Prerendered, so they cost a file each and nothing at runtime.
 */
const HOME = "index";

export function generateStaticParams() {
  return [{ slug: HOME }, ...getLandingSlugs().map((slug) => ({ slug }))];
}

const markdown = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });

/**
 * The home page as prose. This is the only place a crawler can read what the
 * products actually are: on the page itself that copy lives inside a drawer
 * that mounts on click, so it never reaches the served HTML.
 */
function homeMarkdown(): string {
  const products = getProducts();

  const sections = products.map((product) => {
    const heading = product.tag ? `## ${product.name} (${product.tag})` : `## ${product.name}`;
    const link = product.url
      ? `\n\n[${product.name}](${/^https?:\/\//.test(product.url) ? product.url : siteUrl(product.url)})`
      : "";
    return `${heading}\n\n${product.description}\n\n${product.details}${link}`;
  });

  return [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    `Canonical page: ${siteUrl("/")}`,
    "# Products",
    ...sections,
    "# Contact",
    `Email: ${SITE_EMAIL}`,
  ].join("\n\n");
}

/** A landing page as its author wrote it: the answer first, then the body. */
async function landingMarkdown(slug: string): Promise<string | null> {
  const content = await loadLandingContent(slug);
  if (!content) return null;

  const { seo, aeo, hero } = content.frontmatter;

  // Bare filenames resolve against /blog/<slug>/ in the rendered page, so they
  // are made absolute here — a relative path is meaningless once the markdown
  // is read on its own.
  const body = content.body.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_match, alt: string, src: string) => `![${alt}](${siteUrl(resolveImagePath(slug, src))})`,
  );

  return [
    `# ${seo.title ?? hero.title}`,
    `> ${seo.description}`,
    `Canonical page: ${siteUrl(`/${slug}`)}`,
    ...(aeo.question ? [`## ${aeo.question}`] : []),
    aeo.summary,
    ...(aeo.faqs?.length
      ? ["## FAQ", aeo.faqs.map((faq) => `**${faq.q}**\n\n${faq.a}`).join("\n\n")]
      : []),
    body.trim(),
  ].join("\n\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (slug === HOME) return markdown(`${homeMarkdown()}\n`);
  if (!isLandingSlug(slug)) return new Response("Not found", { status: 404 });

  const body = await landingMarkdown(slug);
  return body ? markdown(`${body}\n`) : new Response("Not found", { status: 404 });
}
