"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import TitleReveal from "@/components/TitleReveal";
import { cn } from "@/lib/utils";

// Logo draw completes ~2.15s in (4 lines, last starts at 0.55s + 1.6s duration).
// It then lifts 25% of the viewport height, holds a beat, and the overlay
// fades out. HomeGrid keys its slide-in off INTRO_HOLD_MS + INTRO_FADE_MS.
const DRAW_COMPLETE_MS = 2150;
const LIFT_DURATION_MS = 500;
const HOLD_AFTER_LIFT_MS = 150;

export const INTRO_HOLD_MS = DRAW_COMPLETE_MS + LIFT_DURATION_MS + HOLD_AFTER_LIFT_MS;
export const INTRO_FADE_MS = 600;

interface HomeIntroProps {
  children: React.ReactNode;
  /** Word-by-word title shown in place of the logo once `revealTitle` is true. */
  title: string;
  revealTitle: boolean;
}

export default function HomeIntro({ children, title, revealTitle }: HomeIntroProps) {
  const reduce = useReducedMotion();
  const [curtainVisible, setCurtainVisible] = useState(true);
  const [lifted, setLifted] = useState(false);
  const showTitle = revealTitle && !reduce;

  useEffect(() => {
    if (reduce) {
      setCurtainVisible(false);
      setLifted(true);
      return;
    }
    const liftTimer = setTimeout(() => setLifted(true), DRAW_COMPLETE_MS);
    const curtainTimer = setTimeout(() => setCurtainVisible(false), INTRO_HOLD_MS);
    return () => {
      clearTimeout(liftTimer);
      clearTimeout(curtainTimer);
    };
  }, [reduce]);

  return (
    <>
      {/* Opaque curtain hiding the grid underneath; fades out once, then unmounts. */}
      <AnimatePresence>
        {curtainVisible && (
          <motion.div
            className="fixed inset-0 z-[59] bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : INTRO_FADE_MS / 1000, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
      {/* Logo stays mounted permanently: centered at first, lifts 25vh, and
          remains on screen after the curtain reveals the grid behind it.
          Once the user scrolls the ticker, it fades out and a title reveals
          word-by-word in the exact same spot. */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-1/2 z-[60] flex justify-center transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]",
          lifted ? "-translate-y-[calc(50%+25vh)]" : "-translate-y-1/2",
        )}
        style={{ transitionDuration: `${LIFT_DURATION_MS}ms` }}
      >
        <div className="relative">
          <div className={cn("transition-opacity duration-500 ease-out", showTitle && "opacity-0")}>
            {children}
          </div>
          <TitleReveal title={title} active={showTitle} />
        </div>
      </div>
    </>
  );
}
