"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function CmraLayout({ children }: { children: React.ReactNode }) {
  const isLanding = usePathname() === "/cmra";

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="grid w-full grid-cols-3 items-center px-6 py-6">
        <Link href="/cmra" aria-label="CMRA home" className="justify-self-start rounded-sm text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-4">
          CMRA APP
        </Link>
        <Link href="/cmra" aria-label="CMRA home" className="justify-self-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4">
          <Image
            src="/images/cmra-icon.png"
            alt="CMRA app icon"
            width={56}
            height={56}
            sizes="56px"
            priority
          />
        </Link>
        <div className="justify-self-end">
          <ThemeToggle />
        </div>
      </header>
      <main className={`relative flex flex-1 flex-col ${isLanding ? "min-h-80" : ""}`}>{children}</main>
      <nav aria-label="CMRA" className="mx-auto flex w-full max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 px-6 py-6 text-center text-sm font-medium text-[#a8a8a8]">
        <Link className="hover:underline underline-offset-4" href="/cmra">CMRA</Link>
        <Link className="hover:underline underline-offset-4" href="/cmra/support">Support</Link>
        <Link className="hover:underline underline-offset-4" href="/cmra/privacy">Privacy Policy</Link>
      </nav>
      {!isLanding && (
        <div className="flex justify-center px-6 pt-2 pb-8">
          <Image
            src="/images/cmra-label.svg"
            alt="CMRA APP — ZRH/CH/26 — NOT INC."
            width={229}
            height={51}
            className="h-auto max-w-[168px]"
          />
        </div>
      )}
    </div>
  );
}
