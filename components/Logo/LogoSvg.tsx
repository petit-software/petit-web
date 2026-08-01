"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { LogoShape, LogoSvgData } from "./parseLogo";

interface LogoSvgProps {
  data: LogoSvgData;
  width: number;
  height: number;
  className?: string;
  /** False plays the draw-on animation in reverse — glyphs fade out first,
   *  then lines retrace themselves back to nothing. */
  drawn?: boolean;
  /** Fires when the undraw animation (drawn: true -> false) actually
   *  finishes, from the real last-to-complete shape — not a timer guess. */
  onUndrawComplete?: () => void;
}

function isLine(shape: LogoShape) {
  return shape.stroke != null;
}

function isGlyph(shape: LogoShape) {
  return shape.stroke == null && shape.fill === "currentColor";
}

// Undraw timing — glyphs vanish first, then lines retrace themselves,
// mirroring the draw-on entrance played backwards. Stagger is a large
// fraction of each element's own duration so they read as a scattered
// sequence instead of all animating on top of each other at once.
const LINE_UNDRAW_BASE_DELAY = 0.3;
const LINE_UNDRAW_STAGGER = 0.22;
const LINE_UNDRAW_DURATION = 0.9;
const GLYPH_UNDRAW_STAGGER = 0.13;
const GLYPH_UNDRAW_DURATION = 0.25;
// petit-label.svg has 4 stroked line shapes and 5 glyph shapes. Rather than
// undrawing in the same 0,1,2... order they drew in, each shape's rank
// within its group is looked up from a fixed shuffle so the disappearance
// looks scattered/random instead of a uniform sweep — fixed (not
// Math.random()) so the order is stable across re-renders and identical
// between server and client.
const LINE_UNDRAW_ORDER = [2, 0, 3, 1];
const GLYPH_UNDRAW_ORDER = [3, 0, 4, 1, 2];

function undrawRank(order: number[], i: number) {
  return order[i] ?? i;
}

// The <svg> itself has no properties of its own to animate, but giving it
// `when: "afterChildren"` makes Framer Motion's orchestration wait for every
// propagated child variant to finish before the svg's own "hidden" animation
// (and therefore onAnimationComplete) resolves — the documented way to know
// when a staggered group of children is done, rather than guessing which
// child finishes last via a hardcoded rank.
const containerVariants: Variants = {
  hidden: { transition: { when: "afterChildren" } },
  visible: { transition: { when: "beforeChildren" } },
};

export default function LogoSvg({
  data,
  width,
  height,
  className,
  drawn = true,
  onUndrawComplete,
}: LogoSvgProps) {
  const reduce = useReducedMotion();

  // Lines draw on with a per-line stagger, then glyphs fade in near the end.
  // Undrawing reverses that order — glyphs vanish first, then lines retrace
  // themselves — so it reads as the entrance played backwards.
  const lineVariants: Variants = {
    hidden: (i: number) => {
      const rank = undrawRank(LINE_UNDRAW_ORDER, i);
      return {
        pathLength: 0,
        opacity: 0,
        transition: reduce
          ? { duration: 0 }
          : {
              pathLength: {
                delay: LINE_UNDRAW_BASE_DELAY + rank * LINE_UNDRAW_STAGGER,
                duration: LINE_UNDRAW_DURATION,
                ease: [0.65, 0, 0.35, 1],
              },
              opacity: {
                delay: LINE_UNDRAW_DURATION + rank * LINE_UNDRAW_STAGGER,
                duration: 0.3,
              },
            },
      };
    },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: reduce
        ? { duration: 0 }
        : {
            pathLength: { delay: 0.1 + i * 0.15, duration: 1.6, ease: [0.65, 0, 0.35, 1] },
            opacity: { delay: 0.1 + i * 0.15, duration: 0.3 },
          },
    }),
  };

  const glyphVariants: Variants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: 2,
      transition: reduce
        ? { duration: 0 }
        : {
            delay: undrawRank(GLYPH_UNDRAW_ORDER, i) * GLYPH_UNDRAW_STAGGER,
            duration: GLYPH_UNDRAW_DURATION,
            ease: [0.22, 1, 0.36, 1],
          },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { delay: 0.9 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  let lineIndex = 0;
  let glyphIndex = 0;

  return (
    <motion.svg
      viewBox={data.viewBox}
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Petit"
      className={className}
      variants={containerVariants}
      initial={reduce ? "visible" : "hidden"}
      animate={drawn ? "visible" : "hidden"}
      onAnimationComplete={(definition) => {
        if (definition === "hidden") onUndrawComplete?.();
      }}
      style={{ display: "block" }}
    >
      {data.shapes.map((shape, i) => {
        const line = isLine(shape);
        const glyph = isGlyph(shape);
        const variants = line ? lineVariants : glyph ? glyphVariants : undefined;
        const custom = line ? lineIndex++ : glyph ? glyphIndex++ : 0;

        const common = {
          fill: shape.fill ?? "none",
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
          strokeLinecap: shape.strokeLinecap,
          transform: shape.transform,
          variants,
          custom,
        };

        if (shape.type === "ellipse") {
          return (
            <motion.ellipse
              key={i}
              cx={shape.cx}
              cy={shape.cy}
              rx={shape.rx}
              ry={shape.ry}
              {...common}
            />
          );
        }

        return <motion.path key={i} d={shape.d} {...common} />;
      })}
    </motion.svg>
  );
}
