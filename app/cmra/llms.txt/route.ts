import { loadCmraContent } from "@/lib/cmra";
import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export async function GET() {
  const content = await loadCmraContent("index");
  const body = [
    `# ${content.title}`,
    `> ${content.description}`,
    content.body.trim(),
    "## Pages",
    [
      `- [CMRA overview](${siteUrl("/cmra.md")}): Markdown version of the product page.`,
      `- [CMRA](${siteUrl("/cmra")}): Product page with the interactive phone preview.`,
      `- [Support](${siteUrl("/cmra/support")}): Get help with the app.`,
    ].join("\n"),
    "## Contact",
    "- [Email support](mailto:dev@petit.software): Questions and help with CMRA.",
  ].join("\n\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
