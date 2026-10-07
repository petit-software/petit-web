import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clarity — Terms & Conditions",
  description: "Terms and conditions for Clarity.",
  robots: { index: false },
};

export default function ClarityTermsPage() {
  return (
    <>
      <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Terms &amp; Conditions</h1>
      <p className="text-lg leading-relaxed text-[#505656]">
        The Clarity terms and conditions will be published here soon.
      </p>
    </>
  );
}
