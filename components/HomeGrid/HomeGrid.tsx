"use client";

import { Suspense } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { INTRO_FADE_MS, INTRO_HOLD_MS } from "@/components/HomeIntro";
import ProductList from "@/components/ProductList";
import type { Product } from "@/lib/products";

// Panels slide in only after the intro overlay has fully faded out.
const slideTransition: Transition = {
  delay: (INTRO_HOLD_MS + INTRO_FADE_MS) / 1000,
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

interface HomeGridProps {
  products: Product[];
}

export default function HomeGrid({ products }: HomeGridProps) {
  const reduce = useReducedMotion();

  return (
    <main className="grid min-h-dvh grid-cols-1 gap-2 overflow-x-clip bg-muted p-2 md:h-dvh md:grid-cols-4 md:grid-rows-1 md:gap-0 md:overflow-hidden md:p-0">
      <motion.section
        className="rounded-lg bg-card md:col-span-3 md:m-2"
        initial={reduce ? false : { x: -32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={slideTransition}
      />
      <motion.aside
        className="flex flex-col gap-6 rounded-lg p-6 md:overflow-y-auto"
        initial={reduce ? false : { x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={slideTransition}
      >
        <Suspense fallback={null}>
          <ProductList products={products} />
        </Suspense>
      </motion.aside>
    </main>
  );
}
