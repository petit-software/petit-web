import type { Metadata } from "next";
import Image from "next/image";
import UltraAudience from "@/components/UltraAudience";
import { siteUrl } from "@/lib/metadata";
import {
  loadUltraMarkdown,
  ULTRA_HEADLINE as headline,
  ULTRA_TITLE as title,
  ULTRA_DESCRIPTION as description,
  ULTRA_DOWNLOAD_URL,
  ULTRA_IMAGE_ALT,
} from "@/lib/ultra";

const panels = [
  ["Shell", "Run commands in a terminal that keeps working as you rearrange your panes."],
  ["Agent", "Work with Codex, Claude Code, or Gemini in a dedicated project pane."],
  ["Files", "Browse the project tree and open files without leaving the workspace."],
  ["Editor", "Read and edit files, inspect diffs, and preview Markdown."],
  ["Todo", "Keep a shared Markdown task list that you and your agent can update."],
  ["Git", "See branches, worktrees, and changes, and review file diffs."],
  ["Context", "Keep project files and folders at hand as references for your agent."],
  ["Ports", "Find running development servers and open them in a browser pane."],
  ["Resources", "See CPU and memory usage for the processes running in your panes."],
  ["Chat", "Talk to a model alongside your code, terminal, and project context."],
  ["Browser", "Open URLs, documentation, and local previews right inside Ultra."],
  ["Ultra", "An animated ASCII canvas to keep you company while your agents work."],
] as const;

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Ultra",
  authors: [{ name: "Petit", url: siteUrl() }],
  category: "Developer Tools",
  keywords: ["Ultra", "macOS terminal", "agentic terminal", "coding agents", "Codex", "Claude Code", "Gemini", "native Mac app", "Petit"],
  alternates: {
    canonical: "/ultra",
    types: { "text/markdown": siteUrl("/ultra.md") },
  },
  openGraph: {
    title,
    description,
    url: siteUrl("/ultra"),
    type: "website",
    siteName: "Petit",
    locale: "en_US",
    images: [{ url: siteUrl("/ultra/opengraph-image"), width: 1200, height: 630, type: "image/png", alt: ULTRA_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: siteUrl("/ultra/opengraph-image"), alt: ULTRA_IMAGE_ALT }],
  },
};

export default async function UltraPage() {
  const markdown = await loadUltraMarkdown();
  const now = new Date();
  const initialDate = {
    iso: now.toISOString(),
    label: new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(now),
  };
  return (
    <UltraAudience markdown={markdown} title={title} downloadUrl={ULTRA_DOWNLOAD_URL} initialDate={initialDate}>
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-6 pb-16 text-center sm:px-8 sm:pt-2 sm:pb-20">
        <div className="mt-8 mb-8 flex flex-col items-center gap-7 px-2 sm:mt-10 sm:mb-10 sm:gap-8">
          <Image
            src="/images/ultra-icon.png"
            alt="Ultra app icon"
            width={96}
            height={96}
            sizes="(min-width: 640px) 96px, 80px"
            priority
            className="size-20 sm:size-24"
          />
          <h1 className="max-w-4xl text-4xl leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-6xl md:text-7xl">
            {headline}
          </h1>
          <a
            href={ULTRA_DOWNLOAD_URL}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Download
          </a>
        </div>
        <Image
          src="/images/ultra-demo.gif"
          alt="Ultra terminal preview"
          width={2224}
          height={1112}
          unoptimized
          priority
          className="h-auto w-full"
        />
        <section aria-labelledby="instructions-title" className="grid w-full max-w-5xl gap-8 px-2 py-20 text-left sm:px-4 sm:py-28 md:grid-cols-2 md:gap-16">
          <h2 id="instructions-title" className="max-w-md text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
            Your agent can use Ultra for you.
          </h2>
          <div className="flex flex-col gap-5 text-base leading-relaxed sm:text-lg">
            <p>
              Every project you create in Ultra starts with a predefined set of instructions.
              Your agent knows how to add and complete todos, open URLs in a Browser panel,
              and open files in an Editor panel, directly inside Ultra.
            </p>
            <p className="opacity-60">
              The instructions live in the project’s AGENTS.md, alongside your own conventions.
              You and your agent work from the same task list, with the plan, code, and preview
              together in one workspace.
            </p>
          </div>
        </section>
        <section aria-labelledby="panels-title" className="flex w-full max-w-5xl flex-col gap-10 px-2 pb-16 text-left sm:px-4">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 id="panels-title" className="text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
              A panel for every part of the work.
            </h2>
            <p className="text-base leading-relaxed opacity-60 sm:text-lg">
              Split and arrange native panels around the project you’re building.
            </p>
          </div>
          <dl className="grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {panels.map(([name, detail]) => (
              <div key={name} className="flex flex-col gap-2">
                <dt className="text-lg font-medium">{name}</dt>
                <dd className="text-base leading-relaxed opacity-60">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </UltraAudience>
  );
}
