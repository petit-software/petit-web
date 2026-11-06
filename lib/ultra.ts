import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { siteUrl } from "@/lib/metadata";

export const loadUltraMarkdown = cache(async () => {
  const body = await fs.readFile(path.join(process.cwd(), "content", "ultra", "index.md"), "utf8");
  return `${body.trim()}\n\nCanonical page: ${siteUrl("/ultra")}\n`;
});
