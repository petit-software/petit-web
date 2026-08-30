"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LogoSvg from "@/components/Logo/LogoSvg";
import type { LogoSvgData } from "@/components/Logo/parseLogo";
import TitleReveal from "@/components/TitleReveal";
import { cn } from "@/lib/utils";

// Logo draw completes ~2.15s in (4 lines, last starts at 0.55s + 1.6s duration).
// It then lifts 25% of the viewport height. The curtain starts fading right
// as the lift finishes, and the grid behind it slides in over the same
// window (see HomeGrid's slideTransition) so the section is on screen the
// moment the logo settles at the top instead of waiting on a separate hold.
const DRAW_COMPLETE_MS = 2150;
const LIFT_DURATION_MS = 500;
const UNDRAW_FALLBACK_MS = 2000;

export const INTRO_HOLD_MS = DRAW_COMPLETE_MS + LIFT_DURATION_MS;
export const INTRO_FADE_MS = 600;

interface HomeIntroProps {
  logoData: LogoSvgData;
  /** Word-by-word title shown in place of the logo once `revealTitle` is true. */
  title: string;
  /** Second title line, cycled on a loop under the static one. */
  titleRotations: string[];
  revealTitle: boolean;
}

export default function HomeIntro({ logoData, title, titleRotations, revealTitle }: HomeIntroProps) {
  const reduce = useReducedMotion();
  const [curtainVisible, setCurtainVisible] = useState(true);
  const [lifted, setLifted] = useState(false);
  // Title only starts revealing once the logo's own onAnimationComplete
  // fires — reacting to the real animation instead of a setTimeout guessing
  // its duration avoids racing Framer Motion's own clock (see LogoSvg).
  const [logoUndrawn, setLogoUndrawn] = useState(false);
  const showTitle = revealTitle;
  const handleUndrawComplete = useCallback(() => setLogoUndrawn(true), []);

  useEffect(() => {
    if (!showTitle) {
      setLogoUndrawn(false);
      return;
    }

    if (reduce) {
      setLogoUndrawn(true);
      return;
    }

    // LogoSvg normally reports its exact completion. This timeout only keeps
    // the title handoff from getting permanently stuck if Motion misses that
    // callback during a concurrent render.
    const fallback = window.setTimeout(() => setLogoUndrawn(true), UNDRAW_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [reduce, showTitle]);

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
          Once the ticker is visible, the logo undraws itself; once that
          finishes, a title reveals word-by-word in the exact same spot. */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-1/2 z-[60] flex justify-center transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]",
          lifted ? "-translate-y-[calc(50%+25vh)]" : "-translate-y-1/2",
        )}
        style={{ transitionDuration: `${LIFT_DURATION_MS}ms` }}
      >
        <div className="relative">
          <LogoSvg
            data={logoData}
            width={368}
            height={155}
            drawn={!showTitle}
            onUndrawComplete={handleUndrawComplete}
          />
          <TitleReveal title={title} rotations={titleRotations} active={showTitle && logoUndrawn} />
        </div>
      </div>
    </>
  );
}
