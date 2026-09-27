import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { siteUrl } from "@/lib/metadata";

const title = "CMRA Support";
const description = "Need help with CMRA? Get in touch using the button below.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: siteUrl("/cmra/support") },
  openGraph: { title, description, url: siteUrl("/cmra/support"), type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function CmraSupportPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="max-w-md text-lg text-muted-foreground">
        If you need help with CMRA,<br />
        get in touch using the button below.
      </p>
      <Button asChild>
        <a href="mailto:dev@petit.software">Contact support</a>
      </Button>
    </section>
  );
}
