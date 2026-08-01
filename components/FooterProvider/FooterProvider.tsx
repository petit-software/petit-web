"use client";

import { useCallback, useMemo, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import { FOOTER_HEIGHT, FooterContext } from "./context";

export default function FooterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const value = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <FooterContext.Provider value={value}>
      <div
        className="relative z-10 bg-background transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: open ? `translateY(-${FOOTER_HEIGHT}px)` : undefined }}
      >
        {children}
      </div>
      <SiteFooter />
    </FooterContext.Provider>
  );
}
