"use client";

import Image from "next/image";
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
      className="flex w-full items-center justify-center px-6 pt-16 pb-4 lg:overflow-hidden lg:py-12"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ x, y, rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full max-w-[16rem] sm:max-w-[20rem] lg:max-w-[22rem]"
      >
        <Image
          src="/images/clarity-preview.png"
          alt="Clarity on an iPhone: a welcome screen with saved guidance cards and a voice note being turned into guidance"
          width={1121}
          height={2007}
          priority
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 20rem, 16rem"
          className="h-auto w-full drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
