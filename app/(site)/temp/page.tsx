import HomeExperience from "@/components/HomeExperience";
import LandingHeader from "@/components/LandingHeader";
import Logo from "@/components/Logo";
import { getProducts } from "@/lib/products";

export default function TempPage() {
  const products = getProducts();

  return (
    <>
      <LandingHeader showLogo={false} />
      <HomeExperience products={products} logo={<Logo />} />
    </>
  );
}
