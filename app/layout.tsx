import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import FooterProvider from "@/components/FooterProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_TWITTER_HANDLE,
  siteUrl,
} from "@/lib/metadata";
import "./globals.css";

// Sitewide defaults. Anything a route does not set for itself falls back to
// these, so a new page is never bare — but `alternates.canonical` deliberately
// is NOT here: a canonical set on the root layout is inherited by every child
// that omits one, which would point the whole site at "/".
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "AI studio",
    "AI agents",
    "AI automation",
    "boutique AI studio",
    "Zürich",
    "Switzerland",
    "custom AI software",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: siteUrl(),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...(SITE_TWITTER_HANDLE
      ? { site: SITE_TWITTER_HANDLE, creator: SITE_TWITTER_HANDLE }
      : {}),
  },
  // max-image-preview:large is what lets the share image run full width in a
  // result; max-snippet:-1 lifts the cap on how much of the page an answer
  // engine may quote back.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

// Paints the browser chrome to match the theme on mobile. Split light/dark so
// it follows next-themes rather than fighting it.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="petit-theme-system"
        >
          <FooterProvider>{children}</FooterProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
