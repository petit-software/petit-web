"use client";

import { useEffect } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ascii-bg": React.HTMLAttributes<HTMLElement>;
    }
  }
}

/** Mounts the <ascii-bg> custom element. The definition is imported on the
 *  client only — it closes over `HTMLElement`, which does not exist on the
 *  server — and the element upgrades itself as soon as it lands. */
export default function AsciiBg() {
  useEffect(() => {
    void import("./ascii-bg");
  }, []);

  return <ascii-bg />;
}
