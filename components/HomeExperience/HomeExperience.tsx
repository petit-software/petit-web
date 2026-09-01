"use client";

import { useCallback, useState } from "react";
import HomeGrid from "@/components/HomeGrid";
import LandingHeader from "@/components/LandingHeader";
import HomeIntro from "@/components/HomeIntro";
import type { LogoSvgData } from "@/components/Logo/parseLogo";
import type { Product } from "@/lib/products";

// The newline breaks the line after "studio." on mobile; from md up the two
// halves sit on one line again. See TitleReveal.
const TITLE = "A boutique AI studio.\nZürich + remote.";
const TITLE_ROTATIONS = [
  "We build AI agents that pay for themselves.",
  "We foster growth with a use of dedicated AI automations.",
  "We build AI solution for private and business of any size.",
  "We give small teams the output of a much larger one.",
  "We turn the repetitive work into software that runs itself.",
];

interface HomeExperienceProps {
  products: Product[];
  logoData: LogoSvgData;
}

// Coordinates the intro's logo with the ticker's visibility: HomeIntro and
// HomeGrid are siblings, so the "ticker is on screen" signal has to be
// lifted here to reach both.
export default function HomeExperience({ products, logoData }: HomeExperienceProps) {
  const [revealTitle, setRevealTitle] = useState(false);

  const handleTickerVisible = useCallback(() => {
    setRevealTitle(true);
  }, []);

  return (
    <>
      {/* Inside HomeExperience rather than beside it on the page, so the mark
          draws on the very state the hero text reveals on instead of a second
          timer guessing at the same moment. */}
      <LandingHeader logoActive={revealTitle} />
      <HomeIntro
        title={TITLE}
        titleRotations={TITLE_ROTATIONS}
        revealTitle={revealTitle}
        logoData={logoData}
      />
      <HomeGrid products={products} onTickerVisible={handleTickerVisible} />
    </>
  );
}
