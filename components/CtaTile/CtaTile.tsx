import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// The belt's one non-product tile: exactly a product tile's footprint — same
// width, same height, same transparent ground and hairline ring — so the ask
// sits in the run rather than interrupting it. Height comes from the ticker,
// which measures a real tile.
export default function CtaTile() {
  return (
    <Card className="h-full cursor-default justify-end gap-0 rounded-[24px] bg-transparent p-0 ring-1 ring-border/50 [corner-shape:superellipse(1.1)]">
      <div className="flex flex-col items-start gap-4 px-5 pt-3 pb-5">
        {/* Same type as the hero's title reveal, so the belt's ask lands in
            the voice the site opened with. See TitleReveal. */}
        <h3 className="font-heading text-2xl leading-tight font-medium text-balance text-foreground md:text-3xl">
          AI that pays for itself.
        </h3>
        <p className="text-sm text-muted-foreground">
          Hours returned, revenue recovered. Tell us which number needs to move.
        </p>
        <Button asChild>
          <a href="mailto:hello@petit.com">Start a project</a>
        </Button>
      </div>
    </Card>
  );
}
