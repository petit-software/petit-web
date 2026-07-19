import HomeGrid from "@/components/HomeGrid";
import HomeIntro from "@/components/HomeIntro";
import LandingHeader from "@/components/LandingHeader";
import Logo from "@/components/Logo";
import { getProducts } from "@/lib/products";

export default function TempPage() {
  const products = getProducts();

  return (
    <>
      <LandingHeader showLogo={false} />
      <HomeIntro>
        <Logo />
      </HomeIntro>
      <HomeGrid products={products} />
    </>
  );
}
