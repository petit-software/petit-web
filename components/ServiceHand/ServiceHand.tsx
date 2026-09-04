"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/services";

// Each card lies at its own small angle and height, the way a handful set
// down on a table would, with no progression from one to the next. Picked by
// hand rather than drawn from Math.random, so the pile is the same on every
// visit and the neighbours never happen to line up; a sixth card would take
// the first entry again.
const TILTS_DEG = [-7, 5, -3, 8, -5];
const DRIFTS_PX = [12, -14, 6, -10, 16];
// How far up the picked card rises, clear of the drawer that opens under it.
const PICK_RISE_PX = 80;
// The deal starts this far below the bottom edge of the viewport.
const DEAL_FROM_BELOW_PX = 40;
const DEAL_STAGGER_S = 0.1;

const DEAL = { type: "spring", stiffness: 260, damping: 24 } as const;
const LIFT = { type: "spring", stiffness: 400, damping: 28 } as const;

interface ServiceHandProps {
  services: Service[];
}

export default function ServiceHand({ services }: ServiceHandProps) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  // The drawer keeps showing the last card through its close animation,
  // rather than going blank the moment the selection clears.
  const [shown, setShown] = useState<Service | null>(null);
  // How far the picked card has to slide to sit in the middle of the row,
  // measured when it is picked: the overlap differs per breakpoint, and a
  // measurement is truer than a second copy of the layout's arithmetic.
  const [slide, setSlide] = useState(0);

  // Where the deal starts: every card stacked in the middle of the row, just
  // under the bottom edge of the viewport, before flying out to its place.
  // Each card's distance to the middle is measured on mount, since the
  // overlap differs per breakpoint. Until then the cards are held invisible.
  const rowRef = useRef<HTMLDivElement>(null);
  const [deal, setDeal] = useState<{ xs: number[]; y: number } | null>(null);
  // Once dealt, the keyframes give way to plain resting values, so a later
  // change — a pick, a close — never replays the entrance.
  const [dealt, setDealt] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const middle = rect.left + rect.width / 2;
    setDeal({
      xs: Array.from(row.children, (card) => {
        const box = card.getBoundingClientRect();
        return middle - (box.left + box.width / 2);
      }),
      y: window.innerHeight - rect.top + DEAL_FROM_BELOW_PX,
    });
  }, []);

  const anyPicked = selected !== null;
  const entering = !reduce && deal !== null && !dealt;

  const pick = (index: number, card: HTMLElement) => {
    const row = card.parentElement?.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    // Scale and tilt are both about the card's centre, so the centre is
    // honest even mid-hover.
    setSlide(row ? row.left + row.width / 2 - (box.left + box.width / 2) : 0);
    setSelected(index);
    setShown(services[index]);
  };

  return (
    <>
      {/* The pile. Cards overlap by a share of the row, so it scales with
          the page rather than spilling off a phone. */}
      <div
        ref={rowRef}
        className="mx-auto flex w-full max-w-4xl justify-center px-4 md:max-w-6xl"
      >
        {services.map((service, index) => {
          const rotate = TILTS_DEG[index % TILTS_DEG.length];
          const rest = DRIFTS_PX[index % DRIFTS_PX.length];
          const isSelected = selected === index;
          const number = String(index + 1).padStart(2, "0");

          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={(event) => pick(index, event.currentTarget)}
              aria-label={`${service.title}: ${service.tagline}`}
              // Later cards sit on earlier ones, as they were set down, and a
              // hover leaves that order alone; only the picked card comes to
              // the top.
              style={{
                zIndex: isSelected ? 20 : index,
                // The cleared cards must not catch a click meant for the
                // backdrop while they are faded out.
                pointerEvents: anyPicked && !isSelected ? "none" : undefined,
              }}
              initial={reduce ? false : { x: 0, y: 0, opacity: 0, rotate: 0 }}
              // Dealt from the stack below the fold to its own spot. Picked:
              // squared up, larger, and slid to the middle of the row. The
              // rest clear off the table until the drawer closes.
              animate={
                entering
                  ? { x: [deal.xs[index], 0], y: [deal.y, rest], opacity: 1, rotate: [0, rotate], scale: 1 }
                  : isSelected
                    ? { x: slide, y: -PICK_RISE_PX, opacity: 1, rotate: 0, scale: 1.14 }
                    : anyPicked
                      ? { x: 0, y: rest + 24, opacity: 0, rotate, scale: 0.92 }
                      : { x: 0, y: rest, opacity: 1, rotate, scale: 1 }
              }
              onAnimationComplete={() => {
                if (entering && index === services.length - 1) setDealt(true);
              }}
              whileHover={reduce || anyPicked || entering ? undefined : { y: rest - 16, scale: 1.05 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : entering
                    ? { ...DEAL, delay: index * DEAL_STAGGER_S, opacity: { duration: 0 } }
                    : { ...DEAL, scale: LIFT, x: LIFT, y: LIFT, opacity: { duration: 0.25 } }
              }
              className={cn(
                "relative -ml-[10%] flex aspect-[5/7] w-[28%] max-w-[260px] shrink-0 md:-ml-[4%] md:w-[23%] cursor-pointer flex-col justify-between rounded-[24px] bg-card p-3 text-left text-card-foreground ring-1 ring-border/50 outline-none [corner-shape:superellipse(1.1)] first:ml-0 focus-visible:ring-2 focus-visible:ring-ring sm:p-5",
              )}
            >
              {/* Name at the head of the card, number in its foot; the line
                  under the name waits for the drawer. */}
              <span className="font-heading text-sm leading-tight font-medium text-balance sm:text-2xl">
                {service.title}
              </span>
              <span className="font-mono text-xs text-muted-foreground sm:text-sm">{number}</span>
            </motion.button>
          );
        })}
      </div>

      {/* The same bottom drawer the belt's tiles open, so a service reads
          like a product: full-bleed on a phone, a floating card from sm up. */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full gap-0 rounded-2xl rounded-b-none border-0 p-0 shadow-2xl sm:max-w-3xl sm:rounded-b-2xl data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t-0 sm:data-[side=bottom]:inset-x-4 sm:data-[side=bottom]:bottom-4"
        >
          {shown && (
            <SheetHeader className="gap-3 p-6 sm:p-8">
              <span className="font-mono text-sm text-muted-foreground">
                {String(services.indexOf(shown) + 1).padStart(2, "0")}
              </span>
              <SheetTitle className="font-heading text-2xl sm:text-3xl">{shown.title}</SheetTitle>
              <SheetDescription className="text-base leading-relaxed">
                {shown.description}
              </SheetDescription>
            </SheetHeader>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
