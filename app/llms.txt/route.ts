import { getLandingSlugs } from "@/lib/landing-pages";
import { loadLandingContent } from "@/lib/markdown";
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, siteUrl } from "@/lib/metadata";
import { getProducts } from "@/lib/products";

export const dynamic = "force-static";

/**
 * /llms.txt — the llms.txt convention (llmstxt.org): a single plain-text file
 * an answer engine can read instead of crawling and de-templating the site.
 *
 * It is generated rather than hand-written for the same reason the ticker is:
 * products are auto-discovered from content/products, so a new folder shows up
 * here without anyone remembering to add it. Only the prose below is authored.
 */
const INTRO = `Petit is small on purpose. We take a business's repetitive work — the parts a
person does the same way every time — and turn it into software that runs
itself, so a small team produces what a much larger one would. We build custom
AI agents and automations for private clients and businesses of any size, we
ship our own macOS tools, and we partner with founders on products of their
own. Work is done from Zürich and remotely.

Every page below is linked as its markdown version; drop the .md for the page
itself. Reach the studio at ${SITE_EMAIL}.`;

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : siteUrl(url));

/** One line per link, in the shape llms.txt readers expect. */
const entry = (name: string, url: string, description: string) =>
  `- [${name}](${absolute(url)}): ${description}`;

export async function GET() {
  const products = getProducts();

  const landings = await Promise.all(
    getLandingSlugs().map(async (slug) => {
      const content = await loadLandingContent(slug);
      if (!content) return undefined;
      const { seo, hero, aeo } = content.frontmatter;
      return entry(seo.title ?? hero.title, `/${slug}.md`, aeo.summary ?? seo.description);
    }),
  );

  const sections = [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    INTRO,
    "## Products",
    // A product with no URL has nowhere to send a reader, so it is left out
    // rather than pointed somewhere it does not belong.
    products
      .filter((p) => Boolean(p.url))
      .map((p) =>
        entry(p.name, p.url!, p.tag ? `${p.description} (${p.tag})` : p.description),
      )
      .join("\n"),
    "## Pages",
    [
      entry(
        "Petit",
        "/index.md",
        "The studio and every product it has shipped, in full.",
      ),
      ...landings.filter((line): line is string => Boolean(line)),
    ].join("\n"),
    "## Optional",
    entry(
      "GitHub",
      "https://github.com/petit-software",
      "Source for our open-source tools, including Clio and Ultra.",
    ),
  ];

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
