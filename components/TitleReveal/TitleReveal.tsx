"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface TitleRevealProps {
  title: string;
  active: boolean;
}

// Word-by-word reveal, staggered. Sits absolutely over whatever it's
// replacing (the logo) so the two can cross-fade in place.
export default function TitleReveal({ title, active }: TitleRevealProps) {
  const reduce = useReducedMotion();
  const words = title.split(" ");

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 flex w-[min(90vw,42rem)] -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 text-center font-heading text-2xl leading-tight font-medium text-foreground md:text-3xl"
      aria-hidden={!active}
    >
      {words.map((word, i) => (
        <motion.span key={`${word}-${i}`} custom={i} variants={wordVariants} initial="hidden" animate={active ? "visible" : "hidden"}>
          {word}
        </motion.span>
      ))}
    </div>
  );
}
