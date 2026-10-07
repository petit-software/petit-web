import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clarity — Privacy",
  description: "Privacy information for Clarity.",
  robots: { index: false },
};

export default function ClarityPrivacyPage() {
  return (
    <>
      <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Privacy</h1>
      <p className="text-lg leading-relaxed text-[#505656]">
        The Clarity privacy policy will be published here soon.
      </p>
    </>
  );
}
