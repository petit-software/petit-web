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
          preload={still || reduce ? "none" : "metadata"}
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
          className={objectFit}
        />
      )}
    </div>
  );
}

export default function ProductCard({ product, open, onOpenChange, still }: ProductCardProps) {
  const isOverlay = product.tileLayout === "overlay";

  // modal={false}: skip Radix's body scroll-lock (react-remove-scroll). The
  // ticker already runs its own wheel-interception to drive the belt;
  // layering Radix's generic lock on top of that caused wheel events to stop
  // working intermittently after a sheet open/close cycle. This page has
  // no native scroll to lock anyway (md:overflow-hidden).
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetTrigger className="w-full rounded-[24px] text-left outline-none [corner-shape:superellipse(1.1)] focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="relative cursor-pointer gap-0 rounded-[24px] bg-transparent p-0 ring-1 ring-border/50 [corner-shape:superellipse(1.1)] min-[1280px]:aspect-square">
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
            className={cn(
              isOverlay
                ? "absolute inset-0 size-full"
                : "aspect-video min-[1280px]:aspect-auto min-[1280px]:min-h-0 min-[1280px]:flex-1",
            )}
            sizes="25vw"
          />
          {isOverlay && (
            // Holds the cover's share of the height open now that the media
            // itself is out of flow.
            <div
              className="aspect-video min-[1280px]:aspect-auto min-[1280px]:min-h-0 min-[1280px]:flex-1"
              aria-hidden="true"
            />
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
              // Text sits the same distance from the tile's edges in either
              // layout: an overlay panel spends 8px of margin plus 12px of
              // padding, so 20px at the sides and foot and 12px at the top. The
              // vertical totals have to match too, or a mixed belt goes ragged.
              "px-5 pt-3 pb-5",
              // A panel floating on the media, inset 1rem from the tile's foot
              // and sides. relative so it paints above the out-of-flow cover.
              // The 12px padding plus the 16px bottom margin come to the same
              // 40px the standard layout spends on padding alone, which is
              // what keeps an overlay tile exactly as tall as a standard one.
              isOverlay &&
                "relative mx-2 mb-2 rounded-[14px] bg-background p-3 [corner-shape:superellipse(1.1)]",
            )}
          >
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="min-h-10 min-[1280px]:min-h-0">{product.description}</CardDescription>
          </CardHeader>
        </Card>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[80vh] w-full gap-0 overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl sm:max-w-3xl data-[side=bottom]:inset-x-4 data-[side=bottom]:bottom-4 data-[side=bottom]:h-auto data-[side=bottom]:border-t-0"
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
