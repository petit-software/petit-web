import type { Metadata } from "next";
import HomeExperience from "@/components/HomeExperience";
import { loadLogoSvg } from "@/components/Logo/parseLogo";
import { getProducts } from "@/lib/products";

// This route renders the same page as "/" (app/page.tsx re-exports it), so it
// is kept out of the index and points its canonical at the real home page —
// otherwise the two URLs compete for the same content.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function TempPage() {
  const products = getProducts();
  const logoData = loadLogoSvg();

  return (
    <>
      <HomeExperience products={products} logoData={logoData} />
    </>
  );
}
