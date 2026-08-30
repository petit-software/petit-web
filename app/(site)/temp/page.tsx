import HomeExperience from "@/components/HomeExperience";
import LandingHeader from "@/components/LandingHeader";
import { loadLogoSvg } from "@/components/Logo/parseLogo";
import { getProducts } from "@/lib/products";

export default function TempPage() {
  const products = getProducts();
  const logoData = loadLogoSvg();

  return (
    <>
      <LandingHeader showLogo={false} />
      <HomeExperience products={products} logoData={logoData} />
    </>
  );
}
