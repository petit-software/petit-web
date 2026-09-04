"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  "Enable your team to build internal AI tools, safely and responsibly.",
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

  // The hero settles in the middle of the band between the header and the
  // belt. Neither edge is a constant: the header is as tall as its tallest
  // child, and the belt grows and shrinks with the tile width, which changes
  // per breakpoint. So both are measured — the belt by HomeGrid, the header
  // here — rather than guessed at with a fraction of the viewport that only
  // ever held at the sizes it was tuned on.
  const headerRef = useRef<HTMLElement>(null);
  const [headerBottom, setHeaderBottom] = useState<number | null>(null);
  const [viewportCenter, setViewportCenter] = useState<number | null>(null);
  const [beltTop, setBeltTop] = useState<number | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => {
      setHeaderBottom(header.offsetHeight);
      // Half the viewport is where the hero rests before it lifts, so the
      // lift is measured from there.
      setViewportCenter(window.innerHeight / 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const heroLift =
    headerBottom !== null && viewportCenter !== null && beltTop !== null
      ? Math.round((headerBottom + beltTop) / 2 - viewportCenter)
      : null;

  return (
    <>
      {/* Inside HomeExperience rather than beside it on the page, so the mark
          draws on the very state the hero text reveals on instead of a second
          timer guessing at the same moment. */}
      <LandingHeader ref={headerRef} logoActive={revealTitle} />
      <HomeIntro
        title={TITLE}
        titleRotations={TITLE_ROTATIONS}
        revealTitle={revealTitle}
        lift={heroLift}
        logoData={logoData}
      />
      <HomeGrid
        products={products}
        onTickerVisible={handleTickerVisible}
        onBeltTopChange={setBeltTop}
      />
    </>
  );
}
