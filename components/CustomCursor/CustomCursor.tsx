"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

// A little behind the pointer, so the disc reads as something following the
// hand rather than glued to it.
const FOLLOW_SPRING = { stiffness: 500, damping: 40, mass: 0.6 };
const SHOW_SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

// A pointer-only cursor for the belt. Any element with a `data-cursor` gets
// it: the attribute's value is the label the disc carries ("Open" on a
// product tile), and the element hides the native arrow itself with
// `pointer-fine:cursor-none`, on the same media query this mounts on.
//
// Listens on the document rather than taking a ref because the tiles live in
// a belt that recycles them, and the drawer they open is portalled out of it —
// what counts is what is under the pointer, not where it sits in the tree.
export default function CustomCursor() {
  const reduce = useReducedMotion();
  // (pointer: fine) is a mouse, trackpad or pen; a phone or tablet never
  // mounts this at all.
  const [fine, setFine] = useState(false);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, FOLLOW_SPRING);
  const springY = useSpring(y, FOLLOW_SPRING);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!fine) return;

    // The first move places the disc outright: springing in from the corner
    // it was parked in would be a visible streak.
    let placed = false;
    const onMove = (event: PointerEvent) => {
      if (placed) {
        x.set(event.clientX);
        y.set(event.clientY);
      } else {
        x.jump(event.clientX);
        y.jump(event.clientY);
        placed = true;
      }
    };
    const targetOf = (node: EventTarget | null) =>
      node instanceof Element ? node.closest<HTMLElement>("[data-cursor]") : null;
    const onOver = (event: PointerEvent) => {
      const target = targetOf(event.target);
      if (target) {
        // The label stays through the scale-out, so it never blinks empty.
        setLabel(target.dataset.cursor ?? "");
        setActive(true);
      } else {
        setActive(false);
      }
    };
    const onOut = (event: PointerEvent) => {
      // Leaving for the window's edge, or for anything that is not another
      // cursor target.
      if (!targetOf(event.relatedTarget)) setActive(false);
    };
    // A click on a tile opens its drawer under the pointer, and nothing moves
    // until the hand does; drop the disc rather than leave it over the drawer.
    const onClick = () => setActive(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("click", onClick);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <motion.div
      aria-hidden="true"
      // Above everything, including an open drawer: it is only ever shown
      // over a target, and it never takes a pointer event itself. The
      // translate classes centre the disc on the point; Motion's x/y ride on
      // `transform`, a separate property, so the two compose.
      className="pointer-events-none fixed top-0 left-0 z-[70] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground font-heading text-xs font-medium text-background select-none"
      style={{ x: reduce ? x : springX, y: reduce ? y : springY }}
      initial={false}
      animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : SHOW_SPRING}
    >
      {label}
    </motion.div>
  );
}
