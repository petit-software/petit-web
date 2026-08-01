"use client";

import { useCallback, useState } from "react";
import HomeGrid from "@/components/HomeGrid";
import HomeIntro from "@/components/HomeIntro";
import type { Product } from "@/lib/products";

// Placeholder — swap for real hero copy.
const TITLE = "Petit makes small, focused tools that quietly get out of your way.";

interface HomeExperienceProps {
  products: Product[];
  logo: React.ReactNode;
}

// Coordinates the intro's logo with the ticker's visibility: HomeIntro and
// HomeGrid are siblings, so the "ticker is on screen" signal has to be
// lifted here to reach both.
export default function HomeExperience({ products, logo }: HomeExperienceProps) {
  const [revealTitle, setRevealTitle] = useState(false);

  const handleTickerVisible = useCallback(() => {
    setRevealTitle(true);
  }, []);

  return (
    <>
      <HomeIntro title={TITLE} revealTitle={revealTitle}>
        {logo}
      </HomeIntro>
      <HomeGrid products={products} onTickerVisible={handleTickerVisible} />
    </>
  );
}
