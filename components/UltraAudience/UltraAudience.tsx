"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import LogoWordmark from "@/components/LogoWordmark";
import { Button } from "@/components/ui/button";

export default function UltraAudience({
  children,
  markdown,
  title,
}: {
  children: ReactNode;
  markdown: string;
  title: string;
}) {
  const [audience, setAudience] = useState<"humans" | "agents">("humans");
  const [date, setDate] = useState<{ iso: string; label: string } | null>(null);

  function switchAudience(next: "humans" | "agents") {
    setAudience(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDate({
        iso: now.toISOString(),
        label: new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(now),
      });
    };
    updateDate();
    const timer = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-svh bg-black text-white">
      <header className="dark flex items-center justify-between gap-2 px-4 py-6 sm:px-10">
        <Link
          href="/"
          aria-label="Petit home"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoWordmark height={22} />
        </Link>
        <div role="group" aria-label="Page audience" className="flex shrink-0 gap-0.5">
          <Button type="button" size="xs" variant={audience === "humans" ? "secondary" : "ghost"} aria-pressed={audience === "humans"} onClick={() => switchAudience("humans")}>
            For Humans
          </Button>
          <Button type="button" size="xs" variant={audience === "agents" ? "secondary" : "ghost"} aria-pressed={audience === "agents"} onClick={() => switchAudience("agents")}>
            For Agents
          </Button>
        </div>
        <span className="shrink-0 text-xs opacity-60 sm:text-sm">
          Ultra<span className="hidden min-[360px]:inline"> for macOS</span>
        </span>
      </header>
      {audience === "humans" ? children : (
        <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16" aria-label="Ultra Markdown reference">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 sm:text-base">
            {markdown}
          </pre>
        </main>
      )}
      <footer className="dark mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-16 pb-8 sm:px-10">
        <p className="max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">{title}</p>
        <p className="text-sm opacity-60">
          © Petit · <time dateTime={date?.iso}>{date?.label ?? "\u00a0"}</time>
        </p>
      </footer>
    </div>
  );
}
