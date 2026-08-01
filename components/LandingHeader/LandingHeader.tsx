import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import FooterToggle from "@/components/FooterToggle";

interface LandingHeaderProps {
  showLogo?: boolean;
}

export default function LandingHeader({ showLogo = true }: LandingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="flex w-full items-center justify-between px-6 py-4">
        {showLogo ? (
          <Link href="/" aria-label="Petit — home" className="inline-flex items-center">
            <LogoMark height={36} />
          </Link>
        ) : (
          <span />
        )}
        <FooterToggle />
      </div>
    </header>
  );
}
