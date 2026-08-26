import type { Metadata } from "next";
import Image from "next/image";
import ClarityBetaSignup from "@/components/ClarityBetaSignup";
import ClarityPreview from "@/components/ClarityPreview";

export const metadata: Metadata = {
  title: "Clarity — Intimacy and cancer conversations",
  description:
    "Clarity helps clinicians prepare for conversations about intimacy and cancer with practical resources, thoughtful language, and conversation starters.",
};

export default function ClarityPage() {
  return (
    <main className="min-h-svh bg-muted/40">
      <section className="mx-auto grid min-h-svh w-full max-w-7xl lg:grid-cols-2">
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-10 lg:py-24">
          <div className="flex w-full max-w-xl flex-col gap-8">
            <div className="flex flex-col gap-5">
              <Image
                src="/images/clarity-icon.png"
                alt="Clarity app icon"
                width={50}
                height={50}
                priority
                className="rounded-[14px] outline-[0.5px] outline-black/10 outline-offset-[-0.5px] [corner-shape:superellipse(1.25)]"
              />
              <p className="text-sm font-medium text-muted-foreground">Clarity for clinicians</p>
              <h1 className="max-w-lg text-5xl leading-[0.96] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
                Make sensitive conversations a little easier.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Helpful resources, thoughtful language, and conversation starters for clinicians supporting people through intimacy and cancer.
              </p>
            </div>

            <div className="flex items-start">
              <ClarityBetaSignup />
            </div>
          </div>
        </div>

        <div className="flex items-stretch justify-center">
          <ClarityPreview />
        </div>
      </section>
    </main>
  );
}
