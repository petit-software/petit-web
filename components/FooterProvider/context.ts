"use client";

import { createContext, useContext } from "react";

export const FOOTER_HEIGHT = 64;

interface FooterContextValue {
  open: boolean;
  toggle: () => void;
}

export const FooterContext = createContext<FooterContextValue | null>(null);

export function useFooter(): FooterContextValue {
  const ctx = useContext(FooterContext);
  if (!ctx) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return ctx;
}
