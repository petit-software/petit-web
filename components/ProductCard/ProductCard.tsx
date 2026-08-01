"use client";

import Image from "next/image";
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

interface ProductCardProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProductMedia({
  product,
  className,
  sizes,
}: {
  product: Product;
  className?: string;
  sizes: string;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-chart-1", className)}>
      {product.image && (
        <Image
          src={product.image}
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
        <Card className="cursor-pointer rounded-[24px] bg-muted p-[20px] ring-0">
          <ProductMedia product={product} className="aspect-square rounded-[14px]" sizes="25vw" />
          <CardHeader className="px-0">
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
        </Card>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl sm:max-w-md data-[side=right]:top-4 data-[side=right]:right-4 data-[side=right]:bottom-4 data-[side=right]:h-auto"
      >
        <ProductMedia product={product} className="aspect-video w-full shrink-0" sizes="(min-width: 640px) 28rem, 100vw" />
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.details}</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button asChild>
            <a href={product.url} target="_blank" rel="noreferrer">
              Visit product
            </a>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
