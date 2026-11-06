"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import LogoWordmark from "@/components/LogoWordmark";
import { Button } from "@/components/ui/button";

export default function UltraAudience({
  children,
  markdown,
  title,
  downloadUrl,
  initialDate,
}: {
  children: ReactNode;
  markdown: string;
  title: string;
  downloadUrl: string;
  initialDate: { iso: string; label: string };
}) {
  const [audience, setAudience] = useState<"humans" | "agents">("humans");
  const [date, setDate] = useState(initialDate);

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
      <header className="dark grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-6 sm:px-10">
        <Link
          href="/"
          aria-label="Petit home"
          className="justify-self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoWordmark height={22} />
        </Link>
        <span className="text-center text-xs whitespace-nowrap opacity-60 sm:text-sm">
          Ultra<span className="hidden min-[480px]:inline"> for macOS</span>
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          role="switch"
          aria-label="Show page for agents"
          aria-checked={audience === "agents"}
          title={audience === "humans" ? "Switch to For Agents" : "Switch to For Humans"}
          onClick={() => switchAudience(audience === "humans" ? "agents" : "humans")}
          className="h-9 w-28 justify-self-end gap-1 px-1 sm:w-36 sm:gap-2 sm:px-2.5"
        >
          <span aria-hidden="true" className="relative h-4 w-7 shrink-0 rounded-full bg-white/20">
            <span className={`absolute top-0.5 left-0.5 size-3 rounded-full bg-white transition-transform duration-200 motion-reduce:transition-none ${audience === "agents" ? "translate-x-3" : "translate-x-0"}`} />
          </span>
          <span>{audience === "humans" ? "For Humans" : "For Agents"}</span>
        </Button>
      </header>
      {audience === "humans" ? children : (
        <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16" aria-label="Ultra Markdown reference">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 sm:text-base">
            {markdown}
          </pre>
        </main>
      )}
      <footer className="dark mx-auto flex w-full max-w-7xl flex-col items-center gap-10 border-t border-white/15 px-6 pt-12 pb-8 text-center sm:px-10">
        <div className="flex flex-col items-center gap-6">
          <p className="max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">{title}</p>
          <a
            href={downloadUrl}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Download for macOS
          </a>
        </div>
        <div className="flex flex-col items-center gap-3 text-sm text-white/60">
          <p>© Petit · <time dateTime={date.iso}>{date.label}</time></p>
        </div>
      </footer>
    </div>
  );
}
