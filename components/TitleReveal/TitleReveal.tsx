"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

// How long a rotating line stays on screen once it has finished revealing.
const PHRASE_HOLD_MS = 3600;
const WORD_STAGGER_S = 0.08;

interface TitleRevealProps {
  /** Static lead line, always on screen. A newline in it is a mobile-only
   *  break: the words either side sit on their own row on a narrow screen and
   *  rejoin into one line from md up, where the whole lead fits across. */
  title: string;
  /** Second line, cycled in order. The first entry reveals with the lead line. */
  rotations: string[];
  active: boolean;
}

const toWords = (line: string) => line.trim().split(" ").filter(Boolean);

// Word-by-word reveal, staggered. Sits absolutely over whatever it's
// replacing (the logo) so the two can cross-fade in place.
export default function TitleReveal({ title, rotations, active }: TitleRevealProps) {
  const reduce = useReducedMotion();
  const leadRows = title.split("\n").map(toWords).filter((row) => row.length > 0);
  const leadWordCount = leadRows.reduce((total, row) => total + row.length, 0);
  // Where each row starts in the reveal's stagger, so the words read in order
  // straight through a break rather than restarting the count on the new row.
  const rowOffsets = leadRows.map((_, row) =>
    leadRows.slice(0, row).reduce((total, r) => total + r.length, 0),
  );
  const [phrase, setPhrase] = useState(0);

  // The cycle only runs while the title is on screen, and restarts from the
  // first phrase whenever it is taken off, so the reveal always reads in order.
  useEffect(() => {
    if (!active || rotations.length < 2) {
      setPhrase(0);
      return;
    }
    const timer = window.setInterval(
      () => setPhrase((i) => (i + 1) % rotations.length),
      PHRASE_HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [active, rotations.length]);

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12, filter: reduce ? "blur(0px)" : "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: reduce
        ? { duration: 0 }
        : { duration: 0.5, delay: 0.15 + i * WORD_STAGGER_S, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const rotatingWords = toWords(rotations[phrase] ?? "");
  // Only the first phrase waits on the lead line; later ones start right away
  // so a swap mid-loop doesn't sit blank while the stagger counts up.
  const rotatingOffset = phrase === 0 ? leadWordCount : 0;

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 flex w-[min(90vw,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-y-1 px-6 text-center font-heading text-2xl leading-tight font-medium text-foreground md:text-3xl"
      aria-hidden={!active}
    >
      {/* One row per authored line on mobile, stacked by this column. From md
          up the rows go display:contents, so every word joins a single wrapping
          line again and the break leaves no trace. */}
      <div className="flex flex-col items-center gap-y-1 md:flex-row md:flex-wrap md:justify-center md:gap-x-2">
        {leadRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:contents"
          >
            {row.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                custom={rowOffsets[rowIndex] + i}
                variants={wordVariants}
                initial="hidden"
                animate={active ? "visible" : "hidden"}
              >
                {word}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
      {/* The rotating line is absolutely positioned inside a fixed two-line
          reserve, so a phrase that wraps (or doesn't) can never change the
          block's height and shove the lead line up and down mid-loop. */}
      <div className="relative min-h-[2.5em] w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phrase}
            className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-center gap-x-2 gap-y-1"
            initial={{ opacity: 1, filter: "blur(0px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : -10,
              filter: reduce ? "blur(0px)" : "blur(10px)",
            }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {rotatingWords.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                custom={rotatingOffset + i}
                variants={wordVariants}
                initial="hidden"
                animate={active ? "visible" : "hidden"}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
