"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Logo draw completes ~2.15s in (4 lines, last starts at 0.55s + 1.6s duration);
// hold a beat before fading the overlay out. HomeGrid keys its slide-in off these.
export const INTRO_HOLD_MS = 2600;
export const INTRO_FADE_MS = 600;

interface HomeIntroProps {
  children: React.ReactNode;
}

export default function HomeIntro({ children }: HomeIntroProps) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (reduce) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(false), INTRO_HOLD_MS);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : INTRO_FADE_MS / 1000, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
