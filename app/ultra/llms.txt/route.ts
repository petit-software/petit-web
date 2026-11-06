import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "# Ultra",
    "> An open-source native macOS terminal for coding agents and project tools, by Petit.",
    "## Product information",
    [
      `- [Ultra overview](${siteUrl("/ultra.md")}): Markdown reference with features, supported agents, platform requirements, and official sources.`,
      `- [Ultra product page](${siteUrl("/ultra")}): Agentic Terminal for Software Builders.`,
    ].join("\n"),
    "## Official project",
    [
      "- [Source and README](https://github.com/petit-software/ultra-swift): Current features and build instructions.",
      "- [Latest release](https://github.com/petit-software/ultra-swift/releases/latest): Download Ultra and check release notes.",
      "- [Documentation](https://github.com/petit-software/ultra-swift/tree/main/docs): Design and implementation details.",
    ].join("\n"),
  ].join("\n\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
