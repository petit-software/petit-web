import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/metadata";

export const cmraDocuments = ["privacy"] as const;
export type CmraDocument = (typeof cmraDocuments)[number];
export type CmraPage = "index" | CmraDocument;

export function isCmraDocument(value: string): value is CmraDocument {
  return cmraDocuments.some((document) => document === value);
}

export function cmraSourcePath(page: CmraPage): string {
  return path.join(process.cwd(), "content", "cmra", `${page}.md`);
}

export const loadCmraContent = cache(async (page: CmraPage) => {
  const { data, content } = matter(await fs.readFile(cmraSourcePath(page), "utf8"));
  if (typeof data.title !== "string" || typeof data.description !== "string") {
    throw new Error(`CMRA ${page}.md requires title and description frontmatter.`);
  }
  return {
    title: data.title,
    description: data.description,
    draft: data.draft === true,
    body: content,
  };
});

export async function cmraMetadata(page: CmraPage): Promise<Metadata> {
  const { title, description, draft } = await loadCmraContent(page);
  const url = siteUrl(page === "index" ? "/cmra" : `/cmra/${page}`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(page === "index" ? { types: { "text/markdown": siteUrl("/cmra.md") } } : {}),
    },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    ...(draft ? { robots: { index: false, follow: true } } : {}),
  };
}
