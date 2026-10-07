import Link from "next/link";

export default function ClarityLegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[75svh] bg-[#e3e5e4] px-6 py-8 text-[#191b1b] sm:px-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/clarity" className="inline-block rounded-sm text-sm font-medium text-[#505656] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
          Back to Clarity
        </Link>
        <article className="mt-16 flex flex-col gap-6 sm:mt-24">
          {children}
        </article>
      </div>
    </main>
  );
}
