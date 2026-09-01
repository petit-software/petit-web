"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

// Tag colours are keyed off the label itself, so a product only has to name
// its tag. Anything unlisted falls back to the neutral secondary badge.
const TAG_CLASSES: Record<string, string> = {
  Partnership: "bg-tag-partnership text-tag-partnership-foreground",
  "Client Work": "bg-tag-client text-tag-client-foreground",
  Experiment: "bg-tag-experiment text-tag-experiment-foreground",
};

// Cover and detail may be a still or a short clip; the URL carries a ?v= hash,
// so match the extension ahead of the query.
const VIDEO_PATTERN = /\.(mp4|webm|mov)(\?|$)/i;

// Mapped rather than interpolated, so a content file can never put arbitrary
// CSS into a class name.
const COVER_POSITIONS = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
} as const;

interface ProductCardProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The ticker renders an invisible copy of every card to size its band.
   *  That copy must not decode video it will never show. */
  still?: boolean;
  /** The belt gives every tile the height of the tallest one, so the card
   *  fills that height instead of shrink-wrapping its own content, and the
   *  cover takes up whatever slack the copy leaves. Left off wherever the
   *  card's height is its own to decide — the sizer copies above all, where a
   *  flexible cover in an auto-height column would collapse to nothing. */
  fill?: boolean;
}

function ProductMedia({
  product,
  src,
  className,
  sizes,
  still = false,
  fit = "cover",
  position = "center",
}: {
  product: Product;
  /** cover for the tile, detail for the drawer. */
  src?: string;
  className?: string;
  sizes: string;
  /** The ticker's invisible sizing copies. They mount behind the intro
   *  curtain, before a tile has carried anything onto the belt, which makes
   *  them the page's preloader: every cover is fetched while the logo is still
   *  drawing, so a tile that later picks up that product paints from cache
   *  rather than the network. They still never play — fetched, not decoded. */
  still?: boolean;
  /** contain shows the whole frame; cover fills the box and crops. */
  fit?: "cover" | "contain";
  position?: keyof typeof COVER_POSITIONS;
}) {
  const reduce = useReducedMotion();
  const isVideo = src !== undefined && VIDEO_PATTERN.test(src);
  const objectFit = cn(
    fit === "contain" ? "object-contain" : "object-cover",
    COVER_POSITIONS[position],
  );

  return (
    // The placeholder color block is only for products with no media at all —
    // painting it under a transparent PNG would show through as a grey ground.
    <div className={cn("relative w-full overflow-hidden", !src && "bg-chart-1", className)}>
      {src && isVideo && (
        // Decorative and silent: the product name is already in the card, so
        // the clip carries no information a screen reader needs.
        <video
          src={src}
          className={cn("absolute inset-0 size-full", objectFit)}
          autoPlay={!still && !reduce}
          loop
          muted
          playsInline
          // The sizing copy pulls the whole clip down during the intro so the
          // belt never has to; the copy that plays then needs only metadata,
          // since the bytes are already in cache. Reduced motion plays no clip
          // at all, so it is never worth the bandwidth there.
          preload={reduce ? "none" : still ? "auto" : "metadata"}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      {src && !isVideo && (
        <Image
          src={src}
          alt={product.imageAlt ?? product.name}
          fill
          sizes={sizes}
          // Eager on the sizing copies, so the covers are requested up front
          // during the intro instead of waiting on the lazy loader.
          priority={still}
          className={objectFit}
        />
      )}
    </div>
  );
}

export default function ProductCard({
  product,
  open,
  onOpenChange,
  still,
  fill,
}: ProductCardProps) {
  const isOverlay = product.tileLayout === "overlay";
  // The cover's box, in both layouts. Given a definite height to fill it takes
  // the slack; left to itself it holds 16:9 until the tile turns square.
  const mediaBox = fill
    ? "min-h-0 flex-1"
    : "aspect-video min-[1280px]:aspect-auto min-[1280px]:min-h-0 min-[1280px]:flex-1";

  // modal={false}: skip Radix's body scroll-lock (react-remove-scroll). The
  // ticker already runs its own wheel-interception to drive the belt;
  // layering Radix's generic lock on top of that caused wheel events to stop
  // working intermittently after a sheet open/close cycle. This page has
  // no native scroll to lock anyway (md:overflow-hidden).
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetTrigger
        className={cn(
          "w-full rounded-[24px] text-left outline-none [corner-shape:superellipse(1.1)] focus-visible:ring-2 focus-visible:ring-ring",
          fill && "h-full",
        )}
      >
        <Card
          className={cn(
            "relative cursor-pointer gap-0 rounded-[24px] bg-transparent p-0 ring-1 ring-border/50 [corner-shape:superellipse(1.1)] min-[1280px]:aspect-square",
            fill && "h-full",
          )}
        >
          {/* Both layouts keep the same boxes — a cover-shaped block above a
              text block — so an overlay tile is exactly as tall as a standard
              one and the belt can mix them without going ragged. Overlay only
              changes where the media sits: across the whole card rather than
              in the block above the text. */}
          <ProductMedia
            product={product}
            src={product.image}
            still={still}
            fit={product.coverFit ?? "contain"}
            position={product.coverPosition}
            className={isOverlay ? "absolute inset-0 size-full" : mediaBox}
            sizes="25vw"
          />
          {isOverlay && (
            // Holds the cover's share of the height open now that the media
            // itself is out of flow.
            <div className={mediaBox} aria-hidden="true" />
          )}
          {product.tag && (
            <Badge
              variant="secondary"
              className={cn("absolute top-4 right-4", TAG_CLASSES[product.tag])}
            >
              {product.tag}
            </Badge>
          )}
          <CardHeader
            className={cn(
              "px-5 pt-3 pb-5",
              // A panel floating on the media, inset 0.75rem from the tile's
              // sides and foot. relative so it paints above the out-of-flow
              // cover.
              isOverlay &&
                "relative mx-3 mb-3 rounded-[14px] bg-background p-3 [corner-shape:superellipse(1.1)]",
            )}
          >
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="min-h-10 min-[1280px]:min-h-0">{product.description}</CardDescription>
          </CardHeader>
        </Card>
      </SheetTrigger>
      {/* Full-bleed on a phone: flush to the sides and the foot, with the
          bottom corners squared off against them. w-full is the viewport's
          width, so pairing it with a side inset over-constrains the box — the
          browser drops the right inset and the panel hangs off that edge.
          From sm up it becomes a floating card, inset and capped, where the
          max-width keeps that pairing honest. */}
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[80vh] w-full gap-0 overflow-y-auto rounded-2xl rounded-b-none border-0 p-0 shadow-2xl sm:max-w-3xl sm:rounded-b-2xl data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t-0 sm:data-[side=bottom]:inset-x-4 sm:data-[side=bottom]:bottom-4"
      >
        {/* Fixed height from sm up so the drawer reads as a panel rather than
            shrink-wrapping the copy; the media column stretches to fill it. */}
        <div className="flex flex-col sm:h-[min(23.5rem,60vh)] sm:flex-row">
          <ProductMedia
            product={product}
            src={product.detailImage}
            className="aspect-video w-full shrink-0 sm:aspect-auto sm:h-full sm:w-80"
            sizes="(min-width: 640px) 20rem, 100vw"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <SheetHeader className="min-h-0 flex-1 gap-2 overflow-y-auto p-6">
              <SheetTitle className="text-xl">{product.name}</SheetTitle>
              <SheetDescription>{product.details}</SheetDescription>
            </SheetHeader>
            <SheetFooter className="flex-row flex-wrap items-center justify-end p-6 pt-0">
              {product.github ? (
                <>
                  {/* Resolves the newest release asset server-side — see
                      app/api/download/[slug]/route.ts. */}
                  <Button asChild>
                    <a href={`/api/download/${product.id}`}>Download</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={`https://github.com/${product.github}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <a href={product.url} target="_blank" rel="noreferrer">
                    Visit product
                  </a>
                </Button>
              )}
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
