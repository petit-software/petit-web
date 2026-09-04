"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// How long a rotating line stays on screen once it has finished revealing.
const PHRASE_HOLD_MS = 3600;
const WORD_STAGGER_S = 0.08;

interface TitleRevealProps {
  /** Static lead line, always on screen. On a phone it never wraps: the type
   *  shrinks until the sentence fits its box on one line. */
  title: string;
  /** Second line, cycled in order. The first entry reveals with the lead line.
   *  On a phone every phrase sits on one line at a single shared size, set by
   *  the widest of them, so the loop never changes size or height mid-cycle.
   *  From md up the box is wide enough to let a long phrase wrap instead. */
  rotations: string[];
  active: boolean;
}

// The gaps between words are in em rather than px so a line's width scales
// with its font size — that is what lets a measured overflow turn into a
// plain ratio below.
const LINE_CLASS = "flex items-center justify-center gap-x-[0.3em]";

const toWords = (line: string) => line.trim().split(" ").filter(Boolean);

// Word-by-word reveal, staggered. Sits absolutely over whatever it's
// replacing (the logo) so the two can cross-fade in place.
export default function TitleReveal({ title, rotations, active }: TitleRevealProps) {
  const reduce = useReducedMotion();
  const leadWords = toWords(title);
  const [phrase, setPhrase] = useState(0);

  // How far each row has to shrink from its base size to fit the box on one
  // line, as a factor of 1 or less. Measured off hidden copies of every line
  // at the base size, so the numbers hold for every phrase — the visible
  // rotating line only ever shows one of them, and comes and goes with the
  // cycle, which makes it the wrong thing to measure. Only the phone reads
  // these: from md up the rows wrap and the fixed size wins in CSS.
  const boxRef = useRef<HTMLDivElement>(null);
  const leadProbeRef = useRef<HTMLDivElement>(null);
  const rotationProbeRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ lead: 1, rotation: 1 });

  useLayoutEffect(() => {
    const box = boxRef.current;
    const leadProbe = leadProbeRef.current;
    const rotationProbe = rotationProbeRef.current;
    if (!box || !leadProbe || !rotationProbe) return;

    const measure = () => {
      const style = getComputedStyle(box);
      const available =
        box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const widest = (rows: HTMLElement) =>
        Math.max(0, ...Array.from(rows.children, (row) => (row as HTMLElement).offsetWidth));
      const ratio = (natural: number) =>
        natural > available ? Math.floor((available / natural) * 1000) / 1000 : 1;
      setFit({ lead: ratio(leadProbe.offsetWidth), rotation: ratio(widest(rotationProbe)) });
    };

    measure();
    // Metrics change when the web font lands, and with the viewport width.
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [title, rotations]);

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
  const rotatingOffset = phrase === 0 ? leadWords.length : 0;

  return (
    <div
      ref={boxRef}
      // The box spans the viewport rather than the logo it overlays, so a
      // phone gets the whole width to fit its lines into. The base size is
      // text-2xl; the phone multiplies it by the measured fit, and md restores
      // the fixed sizes over the top of that.
      className="pointer-events-none absolute top-1/2 left-1/2 flex w-screen -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-y-1 px-4 text-center font-heading leading-tight font-medium text-foreground md:w-[min(90vw,42rem)] md:px-6"
      style={{ "--fit-lead": fit.lead, "--fit-rotation": fit.rotation } as CSSProperties}
      aria-hidden={!active}
    >
      {/* Deliberately not flex-wrap: the lead is one line by design. */}
      <div
        className={cn(LINE_CLASS, "flex-nowrap text-[calc(1.5rem*var(--fit-lead))] md:text-3xl")}
      >
        {leadWords.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            custom={i}
            variants={wordVariants}
            initial="hidden"
            animate={active ? "visible" : "hidden"}
          >
            {word}
          </motion.span>
        ))}
      </div>
      {/* The rotating line is absolutely positioned inside a fixed reserve,
          so a phrase that wraps (or doesn't) can never change the block's
          height and shove the lead line up and down mid-loop. On a phone no
          phrase wraps, so the reserve is a single line; from md up it holds
          two. */}
      <div className="relative min-h-[1.25em] w-full text-[calc(1.5rem*var(--fit-rotation))] md:min-h-[2.5em] md:text-3xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phrase}
            className={cn(LINE_CLASS, "absolute inset-x-0 top-0 flex-nowrap items-start md:flex-wrap")}
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
      {/* Hidden copies of every line at the base size, laid out at their
          natural width, for the fit measurement above. Kept in the box so
          they inherit the exact same type. */}
      <div className="invisible absolute top-0 left-0 text-2xl" aria-hidden="true">
        <div ref={leadProbeRef} className={cn(LINE_CLASS, "w-max flex-nowrap")}>
          {leadWords.map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </div>
        <div ref={rotationProbeRef}>
          {rotations.map((line) => (
            <div key={line} className={cn(LINE_CLASS, "w-max flex-nowrap")}>
              {toWords(line).map((word, i) => (
                <span key={`${word}-${i}`}>{word}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
