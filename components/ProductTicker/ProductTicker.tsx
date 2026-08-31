"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import CtaTile from "@/components/CtaTile";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

// 1280px is the small/big desktop line. Below it tiles track the viewport so
// roughly four sit across; at and above it they step up to full size.
//
// Height is in the budget as well as width. Above the line the card is square,
// so a tile is exactly as tall as it is wide, and a width picked from vw alone
// would overflow a short screen — the band would eat the section above it and
// then be clipped. min() takes whichever of the two budgets is tighter.
//
// The belt measures the rendered width rather than assuming it, so this class
// is the only place size is decided: a vh term needs no matching arithmetic,
// and a height-only resize still re-measures because the width changes with it.
const TILE_CLASS =
  "w-[clamp(280px,min(24vw,46vh),346px)] min-[1280px]:w-[min(480px,52vh)]";
// Mirrors the clamp's upper bound. Only used to taper the hover lift, so a
// mismatch here softens an effect rather than breaking the belt's geometry —
// unlike the tile width itself, which is measured rather than assumed.
const TILE_WIDTH_MAX = 480;
// Hover lifts the tile and settles its neighbours by the same amount. Scaled
// down with the tile: 5% reads right at full size but too eager on a narrow
// tile, where neighbours sit closer together to begin with.
const HOVER_LIFT = 0.05;
const GAP = 24; // 1.5rem

// The belt runs over cells, not products, and a cell is half a tile wide — so
// a span can be one and a half tiles, which whole-tile cells could not express.
// A product takes two units, the call to action three, and it sits at the end
// of each pass through the catalogue. Which cell a slot shows still follows
// from its order alone, so the mapping cannot drift however long the loop runs.
// Resizing the ask is a matter of this number; the width follows from the span.
const UNITS_PER_TILE = 2;
const PRODUCT_SPAN = UNITS_PER_TILE;
const CTA_SPAN = 3;
// Off-screen buffer kept queued on each side of the visible window so the loop
// always has tiles ready to enter. In units: ten is five tiles either side.
const BUFFER = 10;
const SPEED = 28; // px/sec ambient drift

// How many of the initially visible tiles get a staggered entrance.
const ENTRANCE_COUNT = 6;
const ENTRANCE_DURATION = 450; // ms
const ENTRANCE_STAGGER = 70; // ms between tiles
const ENTRANCE_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)"; // ease-out-cubic

// A backgrounded tab stops firing rAF entirely; without a ceiling the first
// frame back would carry minutes of dt and fling the belt across the catalog.
const MAX_FRAME_SECONDS = 1 / 20;

// Pointer drag.
const DRAG_THRESHOLD = 4; // px of travel before a press becomes a drag
const VELOCITY_SMOOTHING = 0.7; // weight kept from the running average
const FLICK_TIMEOUT_MS = 80; // pointer held still this long releases dead
const MOMENTUM_FRICTION = 0.94; // fraction of velocity retained per 16ms
const MOMENTUM_MIN = 0.02; // px/ms — below this, momentum stops
const MOMENTUM_MAX = 4; // px/ms — ceiling for a violent flick

// Position is only ever read as (order * step - offset), so shifting both by
// the same amount moves nothing on screen — and when that amount is a whole
// number of catalog lengths, every tile also keeps the product it was already
// showing. Rebasing on that basis keeps the two numbers from growing without
// bound in a tab left open for days, at no visual cost.
const REBASE_THRESHOLD = 1e6; // px

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

// A slot is a recycled DOM element, identified by a stable key and positioned
// by its order along the belt. Which product it shows is *derived* from that
// order rather than tracked alongside it — see productIndexFor.
interface Slot {
  key: number;
  order: number;
}

interface ProductTickerProps {
  products: Product[];
  /** True once the belt has finished sliding into view (see HomeGrid). Gates
   *  the tile entrance so it starts in the same commit as the title reveal
   *  instead of racing it via a separately-scheduled timer. */
  revealed?: boolean;
}

interface TickerTileProps {
  /** null for the call-to-action cell. */
  product: Product | null;
  /** Rendered width. A cell spanning several slots covers the gaps between them. */
  width: number;
  /** Only the call to action needs one; a product card sizes itself. */
  height?: number;
  slotKey: number;
  order: number;
  /** Tile width plus gap. Responsive, so it cannot be a module constant. */
  step: number;
  /** Read once per commit for the mount/recycle transform; the rAF loop owns
   *  the value from then on. A ref rather than a number so a moving belt does
   *  not invalidate the memo on every frame. */
  offsetRef: { current: number };
  open: boolean;
  isHovered: boolean;
  anyHovered: boolean;
  anyOpen: boolean;
  /** Hover lift, tapered to the current tile width. */
  lift: number;
  playEntrance: boolean;
  /** ms of stagger, or null for a tile that was never part of the entrance. */
  entranceDelay: number | null;
  onOpenChange: (id: string, open: boolean) => void;
  onHoverChange: (key: number, hovered: boolean) => void;
  registerElement: (key: number, el: HTMLDivElement | null) => void;
}

// Memoized so a recycle re-renders only the tiles whose product actually
// changed. Under a fast drag several slots can wrap in a single frame, and
// without this every wrap would re-render the whole belt.
const TickerTile = memo(function TickerTile({
  product,
  width,
  height,
  slotKey,
  order,
  step,
  offsetRef,
  open,
  isHovered,
  anyHovered,
  anyOpen,
  lift,
  playEntrance,
  entranceDelay,
  onOpenChange,
  onHoverChange,
  registerElement,
}: TickerTileProps) {
  const setElement = useCallback(
    (el: HTMLDivElement | null) => registerElement(slotKey, el),
    [registerElement, slotKey],
  );
  const handleOpenChange = useCallback(
    (next: boolean) => onOpenChange(product?.id ?? "", next),
    [onOpenChange, product?.id],
  );
  const handleMouseEnter = useCallback(() => onHoverChange(slotKey, true), [onHoverChange, slotKey]);
  const handleMouseLeave = useCallback(() => onHoverChange(slotKey, false), [onHoverChange, slotKey]);

  const isEntranceTile = entranceDelay !== null;
  const scale = anyOpen ? 1 : isHovered ? 1 + lift : anyHovered ? 1 - lift : 1;

  return (
    <div
      ref={setElement}
      className="absolute top-0 left-0"
      style={{
        width,
        height,
        transform: `translate3d(${order * step - offsetRef.current}px, 0, 0)`,
        willChange: "transform",
        zIndex: isHovered ? 10 : 0,
      }}
    >
      <div
        className={cn("h-full origin-bottom", isEntranceTile && "will-change-transform")}
        style={
          isEntranceTile
            ? {
                opacity: playEntrance ? 1 : 0,
                transform: `scale(${playEntrance ? 1 : 0.94})`,
                transition: `opacity ${ENTRANCE_DURATION}ms ${ENTRANCE_EASE}, transform ${ENTRANCE_DURATION}ms ${ENTRANCE_EASE}`,
                transitionDelay: `${entranceDelay}ms`,
              }
            : undefined
        }
      >
        <div
          className="h-full origin-bottom transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale})` }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {product === null ? (
            <CtaTile />
          ) : (
            <ProductCard product={product} open={open} onOpenChange={handleOpenChange} />
          )}
        </div>
      </div>
    </div>
  );
});

// Infinite horizontal marquee of product tiles. Renders a fixed-size window
// of slots (visible + BUFFER ahead + BUFFER behind) and recycles a slot to
// the other end of the belt once it scrolls past the buffer, instead of
// mounting the product list over and over.
export default function ProductTicker({ products, revealed = false }: ProductTickerProps) {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    setOpenId(open ? id : null);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // The band's viewport box, cached. The wheel handler hit-tests against it,
  // and the belt rewrites transforms every frame, so measuring in the wheel
  // handler itself would force layout on every event.
  const bandRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      bandRectRef.current = rect;
      setContainerWidth(rect.width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  // The tile width is whatever CSS resolved TILE_CLASS to, measured off a real
  // tile rather than duplicated as a number here. A breakpoint or clamp in the
  // class then needs no matching arithmetic, which is exactly the kind of pair
  // that drifts apart.
  const tileProbeRef = useRef<HTMLDivElement>(null);
  const [tileWidth, setTileWidth] = useState(0);
  // Height too, so the call to action can match a product tile exactly rather
  // than guessing at whatever the cover and copy currently come to.
  const [tileHeight, setTileHeight] = useState(0);
  useEffect(() => {
    const el = tileProbeRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box && box.width > 0) {
        setTileWidth(box.width);
        setTileHeight(box.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Per unit, not per tile: a tile spans PRODUCT_SPAN of these, and
  // span * step - GAP gives back exactly the tile width.
  const step = (tileWidth + GAP) / UNITS_PER_TILE;
  const lift = HOVER_LIFT * Math.min(tileWidth / TILE_WIDTH_MAX, 1);
  // Nothing is positioned until both measurements are in, so the belt never
  // renders a frame at the wrong size.
  const visibleCount =
    tileWidth > 0 && containerWidth > 0 ? Math.max(1, Math.ceil(containerWidth / step) + 1) : 0;
  const slotCount = visibleCount > 0 ? visibleCount + BUFFER * 2 : 0;

  const [slots, setSlots] = useState<Slot[]>([]);
  const slotsRef = useRef<Slot[]>([]);
  const nextKeyRef = useRef(0);

  // The first ENTRANCE_COUNT on-screen tiles get a one-time staggered reveal.
  // Keyed by slot and captured once, from the first batch, so later recycles
  // and resizes neither re-trigger it nor shift its timing.
  const entranceDelaysRef = useRef<Map<number, number> | null>(null);
  const [playEntrance, setPlayEntrance] = useState(false);

  // Grow the slot window to fill wider viewports. Never shrinks — a few extra
  // off-screen slots after a resize are harmless. New slots append past the
  // current highest order (not at an array index, which stopped tracking
  // order the moment the belt began recycling) to keep the run contiguous.
  useEffect(() => {
    if (products.length === 0 || slotCount === 0 || slotCount <= slotsRef.current.length) return;
    const next = [...slotsRef.current];
    let maxOrder = next.length === 0 ? -BUFFER - 1 : -Infinity;
    for (const slot of next) maxOrder = Math.max(maxOrder, slot.order);
    while (next.length < slotCount) {
      maxOrder += 1;
      next.push({ key: nextKeyRef.current++, order: maxOrder });
    }
    if (entranceDelaysRef.current === null) {
      const delays = new Map<number, number>();
      // Orders are units now, so the window and the stagger both step per tile.
      for (const slot of next) {
        if (slot.order >= 0 && slot.order < ENTRANCE_COUNT * UNITS_PER_TILE) {
          delays.set(slot.key, (slot.order / UNITS_PER_TILE) * ENTRANCE_STAGGER);
        }
      }
      entranceDelaysRef.current = delays;
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

  const registerElement = useCallback((key: number, el: HTMLDivElement | null) => {
    if (el) elementsRef.current.set(key, el);
    else elementsRef.current.delete(key);
  }, []);

  const handleHoverChange = useCallback((key: number, hovered: boolean) => {
    setHoveredKey((current) => (hovered ? key : current === key ? null : current));
  }, []);

  // React bubbles portal content (the drawer) through the *React* tree, not
  // the DOM tree — so onMouseLeave never fires on the tile/container behind
  // an open drawer while the cursor is anywhere inside it, leaving pausedRef
  // and hoveredKey stuck. anyOpen forces both back to their neutral state
  // regardless, rather than depending on the stuck hover signal.
  const anyOpen = openId != null;
  const anyOpenRef = useRef(false);
  useEffect(() => {
    anyOpenRef.current = anyOpen;
  }, [anyOpen]);
  useEffect(() => {
    setHoveredKey(null);
    // Also reset the stuck hover-pause directly: once a drawer has been
    // opened, the container's real onMouseLeave may never fire again (same
    // portal-bubbling issue), so closing it would otherwise leave drift
    // paused forever even though the cursor visually left the ticker.
    pausedRef.current = false;
  }, [anyOpen]);

  const draggingRef = useRef(false);
  const momentumRef = useRef(0); // px/ms, applied after release

  // User scroll (wheel/trackpad) drives offsetRef directly, in either
  // direction. Must be a non-passive listener so preventDefault (which stops
  // the page from also scrolling vertically) actually works.
  //
  // Bound to the window and hit-tested against the band's box rather than
  // bound to the container: every tile is absolutely positioned and scaled, so
  // the topmost element under the cursor in the gaps between them is not
  // reliably a descendant of the container, and a listener on the container
  // never sees those events. Geometry does not care what the tiles are doing.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduce) return;

    const overBand = (e: WheelEvent) => {
      const target = e.target;
      if (target instanceof Node && el.contains(target)) return true;
      const rect = bandRectRef.current;
      if (rect === null) return false;
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    };

    const onWheel = (e: WheelEvent) => {
      if (!overBand(e)) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      // A deliberate scroll takes over from any leftover flick.
      momentumRef.current = 0;
      offsetRef.current += delta;
      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [reduce]);

  // Pointer drag: mouse, touch and pen through one set of handlers.
  //
  // These are native listeners rather than React props on purpose. React
  // bubbles events from portalled content through the React tree, so an
  // onPointerDown here would also fire for presses inside an open drawer —
  // the same portal-bubbling trap the hover state above works around. Native
  // DOM listeners only see what is actually inside the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduce) return;

    let pointerId: number | null = null;
    let startX = 0;
    let lastX = 0;
    let lastMoveAt = 0;
    let velocity = 0; // px/ms, smoothed
    let suppressClick = false;

    const endDrag = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      el.style.removeProperty("user-select");
      el.style.removeProperty("-webkit-user-select");
      // A drag that ends on a tile must not also open it.
      suppressClick = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      lastX = e.clientX;
      lastMoveAt = e.timeStamp;
      velocity = 0;
      // Grabbing the belt stops it dead, including any previous flick.
      momentumRef.current = 0;
      // Clear a suppression left over from a drag that ended on empty space
      // and never produced the click it was waiting to swallow.
      suppressClick = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;

      if (!draggingRef.current) {
        if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return;
        // Past the threshold: this is a drag, not a click.
        draggingRef.current = true;
        el.style.setProperty("user-select", "none");
        el.style.setProperty("-webkit-user-select", "none");
        // Keeps the gesture alive if the pointer leaves the belt mid-drag.
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Pointer already released; the gesture ends on its own.
        }
      }

      const dx = e.clientX - lastX;
      const dt = e.timeStamp - lastMoveAt;
      // Dragging left (negative dx) advances the belt, same sign as drift.
      offsetRef.current -= dx;
      if (dt > 0) {
        const instant = -dx / dt;
        velocity = velocity * VELOCITY_SMOOTHING + instant * (1 - VELOCITY_SMOOTHING);
      }
      lastX = e.clientX;
      lastMoveAt = e.timeStamp;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      if (!draggingRef.current) return;
      // Released from a standstill: let it settle instead of flicking on a
      // stale velocity sample from earlier in the gesture.
      const idle = e.timeStamp - lastMoveAt;
      momentumRef.current = idle > FLICK_TIMEOUT_MS ? 0 : clamp(velocity, -MOMENTUM_MAX, MOMENTUM_MAX);
      endDrag();
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      momentumRef.current = 0;
      endDrag();
    };

    // Capture can be revoked out from under us (another element claims the
    // pointer, the browser takes over the gesture). Without this the drag
    // would never end, and a drag that never ends freezes the belt for good
    // because the loop hands the offset to the pointer for its duration.
    const onLostCapture = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      endDrag();
    };

    // Capture phase, so a click that closed a drag is swallowed before it
    // reaches the tile's trigger. A press that never became a drag is left
    // completely alone.
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    // Product images are natively draggable; without this the browser starts
    // its own drag-and-drop and cancels the pointer stream mid-gesture.
    const onDragStart = (e: Event) => e.preventDefault();

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("lostpointercapture", onLostCapture);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);
    // On window, not the belt: a gesture that leaves the element still has to
    // be tracked and, above all, still has to end.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("lostpointercapture", onLostCapture);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      // Unmounting mid-drag must not leave the belt's selection disabled.
      el.style.removeProperty("user-select");
      el.style.removeProperty("-webkit-user-select");
      draggingRef.current = false;
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce || products.length === 0) return;
    let raf = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);

      if (last === null) last = now;
      const dt = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;

      if (draggingRef.current) {
        // The pointer owns the offset for the duration of the gesture.
      } else {
        if (anyOpenRef.current || !pausedRef.current) offsetRef.current += SPEED * dt;
        if (momentumRef.current !== 0) {
          const ms = dt * 1000;
          offsetRef.current += momentumRef.current * ms;
          momentumRef.current *= Math.pow(MOMENTUM_FRICTION, ms / 16);
          if (Math.abs(momentumRef.current) < MOMENTUM_MIN) momentumRef.current = 0;
        }
      }

      const current = slotsRef.current;
      const count = current.length;
      if (count === 0) return;

      let changed = false;

      if (Math.abs(offsetRef.current) > REBASE_THRESHOLD) {
        // Whole catalog lengths only, so every tile keeps its product.
        const shift = Math.trunc(offsetRef.current / (step * products.length)) * products.length;
        offsetRef.current -= shift * step;
        for (const slot of current) slot.order -= shift;
        changed = true;
      }

      // The belt is exactly the contiguous run of orders [base, base + count).
      // Re-deriving that every frame — rather than stepping one recycle at a
      // time — means any jump, however large, lands correctly in one frame,
      // and no per-recycle bookkeeping can drift out of sync over time.
      const base = Math.floor(offsetRef.current / step) - BUFFER;
      for (const slot of current) {
        const wrapped = base + mod(slot.order - base, count);
        if (wrapped !== slot.order) {
          slot.order = wrapped;
          changed = true;
        }
        const el = elementsRef.current.get(slot.key);
        if (el) {
          el.style.transform = `translate3d(${slot.order * step - offsetRef.current}px, 0, 0)`;
        }
      }

      // Positions are written straight to the DOM every frame for smoothness;
      // React state only moves when a tile's content actually changes, which
      // at drift speed is roughly once per tile every eighteen seconds.
      if (changed) setSlots([...current]);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // step changes only when the breakpoint is crossed; the loop re-derives
    // every position from it on the next frame, so a restart costs nothing.
  }, [reduce, products.length, step]);

  if (products.length === 0) return null;

  if (reduce) {
    return (
      <div className="flex w-full items-center gap-6 overflow-x-auto px-4 pt-4 pb-6">
        {products.map((product) => (
          <div key={product.id} className={cn("shrink-0", TILE_CLASS)}>
            <ProductCard
              product={product}
              open={openId === product.id}
              onOpenChange={(open) => handleOpenChange(product.id, open)}
            />
          </div>
        ))}
        <div className="shrink-0 self-stretch">
          <CtaTile />
        </div>
      </div>
    );
  }

  // Which cell a slot shows follows from where it sits on the belt, so a slot
  // that wraps picks up the next cell for free and the mapping cannot drift no
  // matter how many times the belt recycles. Products take the first cells and
  // the call to action the last CTA_SPAN of them.
  const cellCount = products.length * PRODUCT_SPAN + CTA_SPAN;
  const productUnits = products.length * PRODUCT_SPAN;
  const cellFor = (order: number) => mod(order + BUFFER, cellCount);

  // Only one slot may report itself "open" for a given product, even though
  // the same product can occupy several slots at once around the loop.
  const openSlotKey =
    openId == null
      ? undefined
      : slots.find((slot) => {
          const cell = cellFor(slot.order);
          return cell < productUnits && products[cell / PRODUCT_SPAN]?.id === openId;
        })?.key;

  return (
    <div
      ref={containerRef}
      // touch-pan-y hands vertical panning to the browser and keeps horizontal
      // gestures for the belt, so a touch drag scrolls the ticker rather than
      // the page.
      className="relative w-full touch-pan-y pb-6"
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
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={index === 0 ? tileProbeRef : undefined}
            className={cn("col-start-1 row-start-1", TILE_CLASS)}
          >
            <ProductCard product={product} open={false} onOpenChange={() => {}} still />
          </div>
        ))}
      </div>
      {slots.map((slot) => {
        const cell = cellFor(slot.order);
        // Only a cell's first unit renders; the rest are covered by its width,
        // so the belt has no gap.
        const isCta = cell >= productUnits;
        const isStart = isCta ? cell === productUnits : cell % PRODUCT_SPAN === 0;
        if (!isStart) return null;
        const span = isCta ? CTA_SPAN : PRODUCT_SPAN;
        return (
          <TickerTile
            key={slot.key}
            slotKey={slot.key}
            order={slot.order}
            step={step}
            offsetRef={offsetRef}
            product={isCta ? null : products[cell / PRODUCT_SPAN]}
            width={span * step - GAP}
            height={isCta ? tileHeight : undefined}
            open={slot.key === openSlotKey}
            isHovered={slot.key === hoveredKey}
            anyHovered={hoveredKey !== null}
            anyOpen={anyOpen}
            lift={lift}
            playEntrance={playEntrance}
            entranceDelay={entranceDelaysRef.current?.get(slot.key) ?? null}
            onOpenChange={handleOpenChange}
            onHoverChange={handleHoverChange}
            registerElement={registerElement}
          />
        );
      })}
    </div>
  );
}
