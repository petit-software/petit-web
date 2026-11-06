import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { siteUrl } from "@/lib/metadata";

export const ULTRA_HEADLINE = "Agentic Terminal for Software Builders";
export const ULTRA_TITLE = `Ultra — ${ULTRA_HEADLINE}`;
export const ULTRA_DESCRIPTION = "Ultra is a native macOS terminal for coding agents. Work with Codex, Claude Code, and Gemini alongside shells, files, Git, and a shared task list.";
export const ULTRA_DOWNLOAD_URL = "https://github.com/petit-software/ultra-swift/releases/latest";
export const ULTRA_IMAGE_ALT = "Ultra for macOS — Agentic Terminal for Software Builders. Made by Petit.";

export const loadUltraMarkdown = cache(async () => {
  const body = await fs.readFile(path.join(process.cwd(), "content", "ultra", "index.md"), "utf8");
  return `${body.trim()}\n\nCanonical page: ${siteUrl("/ultra")}\n`;
});
