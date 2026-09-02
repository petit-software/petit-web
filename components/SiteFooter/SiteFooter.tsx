"use client";

import Link from "next/link";
import { MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOOTER_HEIGHT, useFooter } from "@/components/FooterProvider/context";
import { cn } from "@/lib/utils";

export default function SiteFooter() {
  const { open, toggle } = useFooter();
  const year = new Date().getFullYear();

  return (
    <footer
      aria-hidden={!open}
      style={{ height: FOOTER_HEIGHT }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t bg-background transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]",
        open ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex h-full w-full items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close footer"
          title="Close footer"
          onClick={toggle}
        >
          <MinusIcon />
        </Button>
        <span>© {year} Petit</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-colors hover:text-foreground">
            About
          </Link>
          <span aria-hidden="true">/</span>
          <a
            href="mailto:dev@petit.software"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
