import Image from "next/image";
// Imported rather than referenced by path: webpack fingerprints the file, so
// replacing the artwork changes the URL and browsers cannot serve a stale copy.
import ctaBackground from "./cta.png";
import LogoMark from "@/components/LogoMark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// The belt's one non-product tile: wider than a product, product-tile height,
// same card treatment. Sizing comes from the ticker, which measures a real tile.
export default function CtaTile() {
  return (
    <Card className="relative h-full cursor-default justify-end gap-0 rounded-[24px] bg-cta p-0 ring-1 ring-border/50 [corner-shape:superellipse(1.1)]">
      {/* Decorative: the tile's copy carries the meaning, so it stays out of
          the accessibility tree. */}
      <Image
        src={ctaBackground}
        alt=""
        fill
        sizes="(min-width: 1280px) 50vw, 40vw"
        aria-hidden="true"
        className="object-cover"
      />
      {/* Copy and ask sit in one row: text left, button right, both aligned to
          the foot of the tile. shrink-0 keeps the button off the text as the
          tile narrows. */}
      {/* Inset to match the copy below rather than the product tiles' badge,
          so the tile reads as internally aligned. currentColor, so it follows
          the theme instead of being pinned to black. */}
      <LogoMark height={50} className="absolute top-5 right-5" />
      <div className="relative flex items-end justify-between gap-6 px-5 pt-3 pb-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-2xl leading-tight font-medium text-balance">
            Solutions for real problems
          </h3>
          <p className="text-sm text-muted-foreground">
            For operators and founders who want results, not pilots. Small, opinionated AI
            products with proven ROI.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <a href="mailto:dev@petit.software">Build</a>
        </Button>
      </div>
    </Card>
  );
}
