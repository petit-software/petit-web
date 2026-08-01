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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  // working intermittently after a dialog open/close cycle. This page has
  // no native scroll to lock anyway (md:overflow-hidden).
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger className="w-full rounded-[24px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="cursor-pointer rounded-[24px] bg-muted p-[20px] ring-0">
          <ProductMedia product={product} className="aspect-square rounded-[14px]" sizes="25vw" />
          <CardHeader className="px-0">
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[85dvh] max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:grid-rows-[auto_1fr_auto] max-sm:rounded-none">
        <ProductMedia
          product={product}
          className="-mx-4 -mt-4 w-auto aspect-video rounded-t-xl max-sm:rounded-none"
          sizes="(min-width: 640px) 24rem, 100vw"
        />
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.details}</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button asChild>
            <a href={product.url} target="_blank" rel="noreferrer">
              Visit product
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
