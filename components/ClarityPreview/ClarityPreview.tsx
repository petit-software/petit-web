"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export default function ClarityPreview() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.7 });
  const y = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.7 });
  const rotateX = useTransform(y, [-12, 12], [2.5, -2.5]);
  const rotateY = useTransform(x, [-12, 12], [-3, 3]);
  const shadowX = useTransform(x, [-12, 12], [-8, 8]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerX.set(relativeX * 24);
    pointerY.set(relativeY * 24);
  }

  function resetPosition() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      className="flex min-h-[32rem] w-full items-center justify-center overflow-hidden px-6 py-12 sm:min-h-[40rem] lg:min-h-0"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      style={{ perspective: 1000 }}
      aria-label="Clarity app preview coming soon"
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ x, y, rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[9/19] w-[15.5rem] rounded-[2.9rem] border bg-background shadow-2xl sm:w-[18rem]"
        >
          <span
            aria-hidden="true"
            className="absolute top-3 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/10"
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ x: shadowX }}
          className="mt-8 h-4 w-44 rounded-full bg-foreground/10 blur-xl sm:w-52"
        />
      </div>
    </div>
  );
}
