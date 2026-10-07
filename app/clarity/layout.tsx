import Link from "next/link";

export default function ClarityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-[#e3e5e4]">
      {children}
      <footer className="absolute inset-x-0 bottom-0 px-6 py-4 text-center text-sm font-medium text-[#505656] sm:px-10 lg:landscape:px-[6vw] lg:landscape:text-left">
        <div className="flex flex-col gap-2 lg:landscape:w-1/2 lg:landscape:max-w-2xl">
          <p>
            Clarity is a collaboration between Petit, owner of Ruby Care GmbH,
            and Cancer and Intimacy LLC.
          </p>
          <nav aria-label="Clarity legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1 lg:landscape:justify-start">
            <Link href="/clarity/privacy" className="rounded-sm underline-offset-4 transition-colors hover:text-[#191b1b] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
              Privacy
            </Link>
            <Link href="/clarity/terms" className="rounded-sm underline-offset-4 transition-colors hover:text-[#191b1b] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
