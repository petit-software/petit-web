"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { INTRO_HOLD_MS } from "@/components/HomeIntro";
import ProductTicker from "@/components/ProductTicker";
import type { Product } from "@/lib/products";

// Panels start sliding in the moment the logo finishes lifting to the top —
// same instant the curtain starts fading (see HomeIntro) — so the section
// is already in motion as the curtain dissolves instead of waiting for the
// curtain to fully clear first.
const SLIDE_DURATION_MS = 800;
const slideTransition: Transition = {
  delay: INTRO_HOLD_MS / 1000,
  duration: SLIDE_DURATION_MS / 1000,
  ease: [0.22, 1, 0.36, 1],
};

interface HomeGridProps {
  products: Product[];
  onTickerVisible?: () => void;
  /** Reports where the belt's top edge sits, in px from the top of the page,
   *  whenever the viewport or the belt changes size. */
  onBeltTopChange?: (top: number) => void;
}

export default function HomeGrid({ products, onTickerVisible, onBeltTopChange }: HomeGridProps) {
  const reduce = useReducedMotion();
  const spacerRef = useRef<HTMLElement>(null);
  // Single source of truth for "the ticker is on screen" — both the title
  // reveal (via onTickerVisible, lifted to HomeExperience) and the ticker's
  // own tile entrance react to this same event, so they land in the same
  // React commit instead of racing two independently-scheduled timers.
  const [tickerVisible, setTickerVisible] = useState(false);

  // Keep the content handoff on the same deterministic timeline as the intro.
  // Depending on Motion's completion callback here is fragile because the
  // ticker mounts and measures itself while its parent is animating.
  useEffect(() => {
    if (reduce) {
      setTickerVisible(true);
      onTickerVisible?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setTickerVisible(true);
      onTickerVisible?.();
    }, INTRO_HOLD_MS + SLIDE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [reduce, onTickerVisible]);

  // The spacer is the free band above the belt, so its bottom edge is the
  // belt's top edge — and it resizes whenever the viewport or the belt does,
  // which makes one observer enough. Offsets rather than a rect, so the
  // entrance slide's transform doesn't leak into the measurement.
  useEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer || !onBeltTopChange) return;
    const report = () => onBeltTopChange(spacer.offsetTop + spacer.offsetHeight);
    const observer = new ResizeObserver(report);
    observer.observe(spacer);
    return () => observer.disconnect();
  }, [onBeltTopChange]);

  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip bg-card md:h-dvh md:overflow-hidden">
      <motion.section
        ref={spacerRef}
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
      >
        <ProductTicker products={products} revealed={tickerVisible} />
      </motion.aside>
    </main>
  );
}
