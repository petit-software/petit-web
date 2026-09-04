import HeroMark from "@/components/HeroMark";
import LogoWordmark from "@/components/LogoWordmark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Ref } from "react";

interface LandingHeaderProps {
  showLogo?: boolean;
  /** Gates the mark's draw. Defaults to true for pages with no intro to wait
   *  on; the home page passes the same signal its hero text reveals on. */
  logoActive?: boolean;
  /** The header element itself, for a page that needs to know how much of
   *  the top it covers — the home page centres its hero beneath it. */
  ref?: Ref<HTMLElement>;
}

export default function LandingHeader({
  showLogo = true,
  logoActive = true,
  ref,
}: LandingHeaderProps) {
  // The wordmark and the button carry no animation of their own; they fade on
  // the same signal the mark draws on, so the header arrives as one thing
  // rather than two thirds of it sitting there waiting for the middle.
  const arrival = cn(
    "transition-opacity duration-500 ease-out",
    logoActive ? "opacity-100" : "opacity-0",
  );

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50 w-full">
      {/* Three columns rather than justify-between, so the mark stays truly
          centred instead of being pushed off centre by the button's width. */}
      <div className="grid w-full grid-cols-3 items-center px-4 py-4">
        <span className={cn("inline-flex justify-self-start", arrival)}>
          <LogoWordmark height={22} />
        </span>
        {showLogo ? (
          // Deliberately not a link: it is a mark, not navigation.
          <span className="inline-flex justify-self-center">
            <HeroMark active={logoActive} height={27} />
          </span>
        ) : (
          <span />
        )}
        <Button asChild size="lg" className={cn("justify-self-end px-4", arrival)}>
          <a href="mailto:dev@petit.software">Build</a>
        </Button>
      </div>
    </header>
  );
}
