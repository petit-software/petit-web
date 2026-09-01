import HeroMark from "@/components/HeroMark";

interface LandingHeaderProps {
  showLogo?: boolean;
  /** Gates the mark's draw. Defaults to true for pages with no intro to wait
   *  on; the home page passes the same signal its hero text reveals on. */
  logoActive?: boolean;
}

export default function LandingHeader({ showLogo = true, logoActive = true }: LandingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="flex w-full items-center justify-center px-6 py-4">
        {showLogo ? (
          // Deliberately not a link: it is a mark, not navigation.
          <span className="inline-flex items-center">
            <HeroMark active={logoActive} height={27} />
          </span>
        ) : (
          <span />
        )}
      </div>
    </header>
  );
}
