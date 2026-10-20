import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import LogoWordmark from "@/components/LogoWordmark";
import { siteUrl } from "@/lib/metadata";

const title = "Ultra — Terminal for Software Builders";
const description = "Ultra for macOS. Terminal for Software Builders.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ultra" },
  openGraph: {
    title,
    description,
    url: siteUrl("/ultra"),
    images: [{ url: "/images/ultra-demo-poster.webp", width: 2224, height: 1112 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/ultra-demo-poster.webp"],
  },
};

export default function UltraPage() {
  return (
    <div className="min-h-svh bg-black text-white">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link
          href="/"
          aria-label="Petit home"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoWordmark height={22} />
        </Link>
        <span className="text-sm text-white/60">Ultra for macOS</span>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-6 pb-16 text-center sm:px-8 sm:pt-2 sm:pb-20">
        <div className="mt-8 mb-8 flex flex-col items-center gap-7 px-2 sm:mt-10 sm:mb-10 sm:gap-8">
          <h1 className="max-w-3xl text-4xl leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-6xl md:text-7xl">
            Terminal for Software Builders
          </h1>
          <a
            href="https://github.com/petit-software/ultra-swift"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <ArrowDown aria-hidden="true" className="size-4" />
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
      </main>
    </div>
  );
}
