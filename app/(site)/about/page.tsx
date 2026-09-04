import type { Metadata } from "next";
import LandingHeader from "@/components/LandingHeader";
import ServiceHand from "@/components/ServiceHand";
import { services } from "@/lib/services";

// Still a placeholder while the page is written: the header and the hand of
// services under it. Kept out of the index until there is a page to index,
// and out of the sitemap for the same reason — lift both when the content
// lands.
export const metadata: Metadata = {
  title: "About",
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <>
      <LandingHeader />
      {/* Well clear of the fixed header, the title and its line at the top
          and the pile centred in whatever the viewport has left below them. */}
      <main className="flex min-h-dvh flex-col items-center bg-background px-4 pt-44 pb-16 sm:pt-52">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">What We Do</h1>
          {/* One thought, set on two lines from sm up; a phone wraps it as
              it needs to. */}
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            We design, build and run AI systems that do real work inside a business.
            <br className="hidden sm:block" /> Five practices, each scoped to an outcome you can
            measure.
          </p>
        </div>
        <div className="flex w-full flex-1 items-center py-10">
          <ServiceHand services={services} />
        </div>
      </main>
    </>
  );
}
