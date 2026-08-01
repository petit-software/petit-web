"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { INTRO_HOLD_MS } from "@/components/HomeIntro";
import ProductTicker from "@/components/ProductTicker";
import type { Product } from "@/lib/products";

// Panels start sliding in the moment the logo finishes lifting to the top —
// same instant the curtain starts fading (see HomeIntro) — so the section
// is already in motion as the curtain dissolves instead of waiting for the
// curtain to fully clear first.
const slideTransition: Transition = {
  delay: INTRO_HOLD_MS / 1000,
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

interface HomeGridProps {
  products: Product[];
  onTickerVisible?: () => void;
}

export default function HomeGrid({ products, onTickerVisible }: HomeGridProps) {
  const reduce = useReducedMotion();
  // Single source of truth for "the ticker is on screen" — both the title
  // reveal (via onTickerVisible, lifted to HomeExperience) and the ticker's
  // own tile entrance react to this same event, so they land in the same
  // React commit instead of racing two independently-scheduled timers.
  const [tickerVisible, setTickerVisible] = useState(false);

  // Reduced motion skips the slide-in entirely, so there's no animation
  // completion to hook into — fire as soon as it would have appeared.
  useEffect(() => {
    if (reduce) {
      setTickerVisible(true);
      onTickerVisible?.();
    }
  }, [reduce, onTickerVisible]);

  const handleAsideVisible = () => {
    setTickerVisible(true);
    onTickerVisible?.();
  };

  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip bg-card md:h-dvh md:overflow-hidden">
      <motion.section
        className="flex-1 bg-card"
        initial={reduce ? false : { y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={slideTransition}
      />
      <motion.aside
        className="shrink-0 bg-card"
        initial={reduce ? false : { y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={slideTransition}
        onAnimationComplete={reduce ? undefined : handleAsideVisible}
      >
        <Suspense fallback={null}>
          <ProductTicker products={products} revealed={tickerVisible} />
        </Suspense>
      </motion.aside>
    </main>
  );
}
