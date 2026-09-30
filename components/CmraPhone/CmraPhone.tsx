"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PhoneScene = ReturnType<typeof import("./phone-scene").createPhoneScene>;

export default function CmraPhone({ revealed = true }: { revealed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const sceneRef = useRef<PhoneScene | null>(null);
  const revealedRef = useRef(revealed);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        const { createPhoneScene } = await import("./phone-scene");
        if (cancelled || !canvasRef.current) return;
        sceneRef.current = createPhoneScene(canvasRef.current, {
          onReady: () => { if (!cancelled) { setReady(true); setFailed(false); } },
          onError: () => { if (!cancelled) { setReady(false); setFailed(true); } },
        });
        sceneRef.current.setRevealed(revealedRef.current);
      } catch {
        // The static phone remains available when WebGL cannot initialize.
        if (!cancelled) { setReady(false); setFailed(true); }
      }
    }

    void mount();
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // The screen recording starts with the reveal, so it opens on its first frame.
  useEffect(() => {
    revealedRef.current = revealed;
    sceneRef.current?.setRevealed(revealed);
  }, [revealed]);

  return (
    <div
      className="relative mx-auto min-h-[380px] w-full flex-1"
      inert={!revealed}
      aria-hidden={!revealed}
      role={ready ? undefined : "img"}
      aria-label={ready ? undefined : "CMRA running on a white iPhone with an uninterrupted display."}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center px-10 py-5 transition-[opacity,transform] duration-700 delay-[60ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-200 motion-reduce:delay-0 motion-reduce:transform-none ${revealed && failed && fallbackLoaded ? "[transform:translateY(0)_scale(1)] opacity-100" : "[transform:translateY(16px)_scale(0.9)] opacity-0"}`}
      >
        <div className="relative h-full max-h-[660px] max-w-full aspect-[1206/2622] rounded-[23.4%/11.1%] border-[5px] border-white bg-black p-[3px] shadow-xl [corner-shape:superellipse(1.5)]">
          <Image
            src="/images/cmra-screen.png"
            alt=""
            width={1206}
            height={2622}
            priority
            onLoad={() => setFallbackLoaded(true)}
            sizes="(max-width: 640px) 75vw, 320px"
            className="h-full w-full rounded-[21.7%/10%] object-contain [corner-shape:superellipse(1.5)]"
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        role="button"
        aria-label="Rotate the CMRA phone 180 degrees"
        aria-hidden={!ready || !revealed}
        tabIndex={ready && revealed ? 0 : -1}
        className={`absolute inset-0 block h-full w-full cursor-pointer transition-[opacity,transform] duration-700 delay-[60ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-200 motion-reduce:delay-0 motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-4 ${ready && revealed ? "[transform:translateY(0)_scale(1)] opacity-100" : "pointer-events-none [transform:translateY(16px)_scale(0.9)] opacity-0"}`}
      />
    </div>
  );
}
