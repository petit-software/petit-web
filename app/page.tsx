import type { Metadata } from "next";
import TempPage from "@/app/(site)/temp/page";
import { siteJsonLd } from "@/lib/structured-data";

// The home page is the only route that carries the sitewide entity graph, so
// there is exactly one Organization node for a crawler to resolve against.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomeRoute() {
  const jsonLd = siteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TempPage />
    </>
  );
}
