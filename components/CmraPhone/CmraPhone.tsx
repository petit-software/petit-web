"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function CmraPhone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;

    async function mount() {
      try {
        const { createPhoneScene } = await import("./phone-scene");
        if (cancelled || !canvasRef.current) return;
        dispose = createPhoneScene(canvasRef.current, {
          onReady: () => { if (!cancelled) setReady(true); },
          onError: () => { if (!cancelled) setReady(false); },
        });
      } catch {
        // The static phone remains available when WebGL cannot initialize.
        if (!cancelled) setReady(false);
      }
    }

    void mount();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div
      className="relative mx-auto min-h-[380px] w-full flex-1"
      role="img"
      aria-label="CMRA running on a white iPhone with an uninterrupted display. The phone tilts gently with mouse movement."
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center px-10 py-5 transition-opacity duration-300 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <div className="relative h-full max-h-[660px] max-w-full aspect-[1206/2622] rounded-[26%/12.3%] border-[5px] border-white bg-black p-[3px] shadow-xl [corner-shape:superellipse(1.5)]">
          <Image
            src="/images/cmra-screen.png"
            alt=""
            width={1206}
            height={2622}
            priority
            sizes="(max-width: 640px) 75vw, 320px"
            className="h-full w-full rounded-[24.5%/11.25%] object-contain [corner-shape:superellipse(1.5)]"
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 block h-full w-full transition-opacity duration-300 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
