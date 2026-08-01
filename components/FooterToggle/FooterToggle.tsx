"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFooter } from "@/components/FooterProvider";

export default function FooterToggle() {
  const { open, toggle } = useFooter();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={open ? "Close footer" : "Open footer"}
      aria-expanded={open}
      title={open ? "Close footer" : "Open footer"}
      onClick={toggle}
    >
      {open ? <MinusIcon /> : <PlusIcon />}
    </Button>
  );
}
