import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { siteUrl } from "@/lib/metadata";

const title = "Clio Support";
const description = "Need help with Clio? Get in touch using the button below.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: siteUrl("/clio/support") },
  openGraph: { title, description, url: siteUrl("/clio/support"), type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function ClioSupportPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center text-foreground">
      <p className="max-w-md text-lg text-muted-foreground">
        If you need help with Clio,<br />
        get in touch using the button below.
      </p>
      <Button asChild>
        <a href="mailto:dev@petit.software">Contact support</a>
      </Button>
    </main>
  );
}
