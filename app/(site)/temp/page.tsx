import HomeExperience from "@/components/HomeExperience";
import { loadLogoSvg } from "@/components/Logo/parseLogo";
import { getProducts } from "@/lib/products";

export default function TempPage() {
  const products = getProducts();
  const logoData = loadLogoSvg();

  return (
    <>
      <HomeExperience products={products} logoData={logoData} />
    </>
  );
}
