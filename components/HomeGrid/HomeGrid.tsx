"use client";

import { Suspense, useEffect } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { INTRO_FADE_MS, INTRO_HOLD_MS } from "@/components/HomeIntro";
import ProductTicker from "@/components/ProductTicker";
import type { Product } from "@/lib/products";

// Panels slide in only after the intro overlay has fully faded out.
const slideTransition: Transition = {
  delay: (INTRO_HOLD_MS + INTRO_FADE_MS) / 1000,
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

interface HomeGridProps {
  products: Product[];
  onTickerVisible?: () => void;
}

export default function HomeGrid({ products, onTickerVisible }: HomeGridProps) {
  const reduce = useReducedMotion();

  // Reduced motion skips the slide-in entirely, so there's no animation
  // completion to hook into — fire as soon as it would have appeared.
  useEffect(() => {
    if (reduce) onTickerVisible?.();
  }, [reduce, onTickerVisible]);

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
        onAnimationComplete={reduce ? undefined : onTickerVisible}
      >
        <Suspense fallback={null}>
          <ProductTicker products={products} />
        </Suspense>
      </motion.aside>
    </main>
  );
}
