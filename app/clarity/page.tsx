import type { Metadata } from "next";
import Image from "next/image";
import ClarityBetaSignup from "@/components/ClarityBetaSignup";

export const metadata: Metadata = {
  title: "Clarity — Intimacy and cancer conversations",
  description:
    "Clarity helps clinicians prepare for conversations about intimacy and cancer with practical resources, thoughtful language, and conversation starters.",
};

export default function ClarityPage() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#e3e5e4] text-[#191b1b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vw] max-h-[32rem] overflow-hidden lg:landscape:inset-0 lg:landscape:h-full lg:landscape:max-h-none">
        <Image
          src="/images/clarity-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-[1.35] object-cover object-center opacity-65 lg:landscape:scale-100 lg:landscape:object-left lg:landscape:opacity-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#e3e5e4_0%,transparent_45%,#e3e5e4_100%)] lg:landscape:bg-[linear-gradient(to_right,rgba(227,229,228,0.65)_0%,rgba(227,229,228,0.25)_30%,transparent_52%)]" />
      </div>
      <section className="relative flex min-h-svh w-full items-start px-6 pt-8 pb-[calc(70vw+2rem)] sm:items-center sm:px-10 sm:pt-16 lg:landscape:px-[6vw] lg:landscape:py-24">
        <div className="w-full lg:landscape:w-1/2 lg:landscape:max-w-2xl">
          <div className="flex w-full flex-col gap-8 text-center lg:landscape:text-left">
            <div className="flex flex-col items-center gap-5 lg:landscape:items-start">
              <Image
                src="/images/clarity-icon.png"
                alt="Clarity app icon"
                width={50}
                height={50}
                priority
                className="rounded-[14px] outline-[0.5px] outline-black/10 outline-offset-[-0.5px] [corner-shape:superellipse(1.25)]"
              />
              <p className="text-sm font-medium text-[#505656]">Clarity for clinicians</p>
              <h1 className="w-full text-[2.5rem] leading-[0.96] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:landscape:text-[clamp(3rem,5vw,4.5rem)]">
                Make <br className="lg:landscape:hidden" />
                sensitive conversations <br className="lg:landscape:hidden" />
                easier.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-[#505656] sm:text-xl">
                Helpful resources, thoughtful language, and conversation starters for clinicians supporting people through intimacy and cancer.
              </p>
            </div>

            <div className="flex items-start justify-center lg:landscape:justify-start">
              <ClarityBetaSignup />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
