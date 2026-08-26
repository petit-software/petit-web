"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

const TILE_WIDTH = 480;
const GAP = 24; // 1.5rem
const STEP = TILE_WIDTH + GAP;
// Off-screen buffer kept queued on each side of the visible window so the
// loop always has tiles ready to enter — 5 ahead, 5 behind.
const BUFFER = 5;
const SPEED = 28; // px/sec ambient drift

// How many of the initially visible tiles get a staggered entrance.
const ENTRANCE_COUNT = 6;
const ENTRANCE_DURATION = 450; // ms
const ENTRANCE_STAGGER = 70; // ms between tiles
const ENTRANCE_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)"; // ease-out-cubic

interface Slot {
  key: number;
  order: number;
  productIndex: number;
}

interface ProductTickerProps {
  products: Product[];
  /** True once the belt has finished sliding into view (see HomeGrid). Gates
   *  the tile entrance so it starts in the same commit as the title reveal
   *  instead of racing it via a separately-scheduled timer. */
  revealed?: boolean;
}

// Infinite horizontal marquee of product tiles. Renders a fixed-size window
// of slots (visible + BUFFER ahead + BUFFER behind) and recycles a slot to
// the front of the belt once it scrolls fully past the back buffer, instead
// of mounting the product list over and over.
export default function ProductTicker({ products, revealed = false }: ProductTickerProps) {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (id: string, open: boolean) => {
      setOpenId(open ? id : null);
    },
    [],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setVisibleCount(Math.max(1, Math.ceil(width / STEP) + 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slotCount = visibleCount > 0 ? visibleCount + BUFFER * 2 : 0;
  const visibleCountRef = useRef(visibleCount);
  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const slotsRef = useRef<Slot[]>([]);
  const nextKeyRef = useRef(0);
  const nextProductRef = useRef(0);
  const prevProductRef = useRef(-1);

  // The first ENTRANCE_COUNT on-screen tiles (order 0..ENTRANCE_COUNT-1) get
  // a one-time staggered reveal. Captured once, from the first slot batch,
  // so later recycles/resizes never re-trigger it.
  const entranceKeysRef = useRef<Set<number> | null>(null);
  const [playEntrance, setPlayEntrance] = useState(false);

  // Grow the slot window to fill wider viewports. Never shrinks — a few
  // extra off-screen slots after a resize are harmless.
  useEffect(() => {
    if (products.length === 0 || slotCount === 0 || slotCount <= slotsRef.current.length) return;
    const next = [...slotsRef.current];
    while (next.length < slotCount) {
      next.push({
        key: nextKeyRef.current++,
        order: next.length - BUFFER,
        productIndex: nextProductRef.current++ % products.length,
      });
    }
    if (entranceKeysRef.current === null) {
      entranceKeysRef.current = new Set(
        next.filter((slot) => slot.order >= 0 && slot.order < ENTRANCE_COUNT).map((slot) => slot.key),
      );
    }
    slotsRef.current = next;
    setSlots(next);
  }, [slotCount, products.length]);

  useEffect(() => {
    if (reduce || !revealed) return;
    setPlayEntrance(true);
  }, [reduce, revealed]);

  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const elementsRef = useRef(new Map<number, HTMLDivElement>());
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);

  // React bubbles portal content (the Sheet) through the *React* tree, not
  // the DOM tree — so onMouseLeave never fires on the tile/container behind
  // an open sheet while the cursor is anywhere inside it, leaving pausedRef
  // and hoveredKey stuck. anyOpen forces both back to their neutral state
  // regardless, rather than depending on the stuck hover signal.
  const anyOpen = openId != null;
  const anyOpenRef = useRef(false);
  useEffect(() => {
    anyOpenRef.current = anyOpen;
  }, [anyOpen]);
  useEffect(() => {
    setHoveredKey(null);
    // Also reset the stuck hover-pause directly: once a sheet has been
    // opened, the container's real onMouseLeave may never fire again (same
    // portal-bubbling issue), so closing it would otherwise leave drift
    // paused forever even though the cursor visually left the ticker.
    pausedRef.current = false;
  }, [anyOpen]);

  // User scroll (wheel/trackpad) drives offsetRef directly, in either
  // direction. Must be a native, non-passive listener so preventDefault
  // (which stops the page from also scrolling vertically) actually works.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduce) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      offsetRef.current += delta;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [reduce]);

  useEffect(() => {
    if (reduce || products.length === 0) return;
    let raf = 0;
    let last: number | null = null;

    const mod = (n: number) => ((n % products.length) + products.length) % products.length;

    const tick = (now: number) => {
      if (last === null) last = now;
      const dt = (now - last) / 1000;
      last = now;
      if (anyOpenRef.current || !pausedRef.current) offsetRef.current += SPEED * dt;

      const current = slotsRef.current;
      const aheadEdge = (visibleCountRef.current + BUFFER) * STEP;
      let maxOrder = -Infinity;
      let minOrder = Infinity;
      for (const slot of current) {
        maxOrder = Math.max(maxOrder, slot.order);
        minOrder = Math.min(minOrder, slot.order);
      }

      let recycled = false;
      for (const slot of current) {
        const x = slot.order * STEP - offsetRef.current;
        if (x + STEP < -BUFFER * STEP) {
          // Scrolled fully behind the back buffer — recycle to the front.
          maxOrder += 1;
          slot.order = maxOrder;
          slot.productIndex = mod(nextProductRef.current++);
          recycled = true;
        } else if (x > aheadEdge) {
          // Scrolled (backward) fully past the front buffer — recycle to the back.
          minOrder -= 1;
          slot.order = minOrder;
          slot.productIndex = mod(prevProductRef.current--);
          recycled = true;
        }
        const el = elementsRef.current.get(slot.key);
        if (el) {
          const nx = slot.order * STEP - offsetRef.current;
          el.style.transform = `translate3d(${nx}px, 0, 0)`;
        }
      }

      // Position updates above are applied directly to the DOM every frame
      // for smoothness; only bump React state when a tile's content actually
      // changed (a recycle), which happens roughly once every few seconds.
      if (recycled) setSlots([...current]);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, products.length]);

  if (products.length === 0) return null;

  if (reduce) {
    return (
      <div className="flex w-full items-center gap-6 overflow-x-auto px-4 pt-4 pb-6">
        {products.map((product) => (
          <div key={product.id} className="w-[480px] shrink-0">
            <ProductCard
              product={product}
              open={openId === product.id}
              onOpenChange={(open) => handleOpenChange(product.id, open)}
            />
          </div>
        ))}
      </div>
    );
  }

  // Only one slot may report itself "open" for a given product, even though
  // the same product can occupy several slots at once around the loop.
  const openProductIndex = products.findIndex((p) => p.id === openId);
  const openSlotKey = slots.find((s) => s.productIndex === openProductIndex)?.key;

  return (
    <div
      ref={containerRef}
      className="relative w-full pb-6"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {/* Sizer: not part of the animated belt, just establishes the band's
          height from the tallest product tile so nothing gets clipped. */}
      <div className="invisible grid" aria-hidden="true" inert>
        {products.map((product) => (
          <div key={product.id} className="col-start-1 row-start-1 w-[480px]">
            <ProductCard product={product} open={false} onOpenChange={() => {}} />
          </div>
        ))}
      </div>
      {slots.map((slot) => {
        const product = products[slot.productIndex];
        const isHovered = slot.key === hoveredKey;
        const isEntranceTile = entranceKeysRef.current?.has(slot.key) ?? false;
        return (
          <div
            key={slot.key}
            ref={(el) => {
              if (el) elementsRef.current.set(slot.key, el);
              else elementsRef.current.delete(slot.key);
            }}
            className="absolute top-0 left-0 w-[480px]"
            style={{
              transform: `translate3d(${slot.order * STEP - offsetRef.current}px, 0, 0)`,
              willChange: "transform",
              zIndex: isHovered ? 10 : 0,
            }}
          >
            <div
              className={cn("origin-bottom", isEntranceTile && "will-change-transform")}
              style={
                isEntranceTile
                  ? {
                      opacity: playEntrance ? 1 : 0,
                      transform: `scale(${playEntrance ? 1 : 0.94})`,
                      transition: `opacity ${ENTRANCE_DURATION}ms ${ENTRANCE_EASE}, transform ${ENTRANCE_DURATION}ms ${ENTRANCE_EASE}`,
                      transitionDelay: `${slot.order * ENTRANCE_STAGGER}ms`,
                    }
                  : undefined
              }
            >
              <div
                className={cn(
                  "origin-bottom transition-transform duration-300 ease-out",
                  !anyOpen && isHovered
                    ? "scale-105"
                    : !anyOpen && hoveredKey !== null
                      ? "scale-95"
                      : "scale-100",
                )}
                onMouseEnter={() => setHoveredKey(slot.key)}
                onMouseLeave={() => setHoveredKey((k) => (k === slot.key ? null : k))}
              >
                <ProductCard
                  product={product}
                  open={slot.key === openSlotKey}
                  onOpenChange={(open) => handleOpenChange(product.id, open)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
