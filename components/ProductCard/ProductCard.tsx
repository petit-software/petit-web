"use client";

import Image from "next/image";
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
};

interface ProductCardProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProductMedia({
  product,
  src,
  className,
  sizes,
}: {
  product: Product;
  /** cover for the tile, detail for the drawer. */
  src?: string;
  className?: string;
  sizes: string;
}) {
  return (
    // The placeholder color block is only for products with no image at all —
    // painting it under a transparent PNG would show through as a grey ground.
    <div className={cn("relative w-full overflow-hidden", !src && "bg-chart-1", className)}>
      {src && (
        <Image
          src={src}
          alt={product.imageAlt ?? product.name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}

export default function ProductCard({ product, open, onOpenChange }: ProductCardProps) {
  // modal={false}: skip Radix's body scroll-lock (react-remove-scroll). The
  // ticker already runs its own wheel-interception to drive the belt;
  // layering Radix's generic lock on top of that caused wheel events to stop
  // working intermittently after a sheet open/close cycle. This page has
  // no native scroll to lock anyway (md:overflow-hidden).
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetTrigger className="w-full rounded-[24px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="relative cursor-pointer rounded-[24px] bg-transparent p-[20px] pt-0 ring-1 ring-border">
          <ProductMedia
            product={product}
            src={product.image}
            className="aspect-square rounded-[14px]"
            sizes="25vw"
          />
          {product.tag && (
            <Badge
              variant="secondary"
              className={cn("absolute top-4 right-4", TAG_CLASSES[product.tag])}
            >
              {product.tag}
            </Badge>
          )}
          <CardHeader className="px-0">
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
        </Card>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[80vh] w-full gap-0 overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl sm:max-w-3xl data-[side=bottom]:inset-x-4 data-[side=bottom]:bottom-4 data-[side=bottom]:h-auto data-[side=bottom]:border-t-0"
      >
        {/* Fixed height from sm up so the drawer reads as a panel rather than
            shrink-wrapping the copy; the media column stretches to fill it. */}
        <div className="flex flex-col sm:h-[26rem] sm:flex-row">
          <ProductMedia
            product={product}
            src={product.detailImage}
            className="aspect-video w-full shrink-0 sm:aspect-auto sm:h-full sm:w-80"
            sizes="(min-width: 640px) 20rem, 100vw"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <SheetHeader className="gap-2 p-6">
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
