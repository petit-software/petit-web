import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// The belt's one non-product tile: wider than a product, product-tile height,
// same card treatment. Sizing comes from the ticker, which measures a real tile.
export default function CtaTile() {
  return (
    <Card className="relative h-full cursor-default justify-end gap-0 rounded-[24px] bg-transparent p-0 ring-1 ring-border/50 [corner-shape:superellipse(1.1)]">
      {/* Decorative: the tile's copy carries the meaning, so it stays out of
          the accessibility tree. */}
      <Image
        src="/images/cta.png"
        alt=""
        fill
        sizes="(min-width: 1280px) 50vw, 40vw"
        aria-hidden="true"
        className="object-cover"
      />
      {/* Copy and ask sit in one row: text left, button right, both aligned to
          the foot of the tile. shrink-0 keeps the button off the text as the
          tile narrows. */}
      <div className="relative flex items-end justify-between gap-6 px-5 pt-3 pb-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-2xl leading-tight font-medium text-balance">
            AI that earns its keep.
          </h3>
          <p className="text-sm text-muted-foreground">
            We build the products on this belt — offers won back, notes written, hours returned.
            Tell us which number yours needs to move.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <a href="mailto:hello@petit.com">Start a project</a>
        </Button>
      </div>
    </Card>
  );
}
