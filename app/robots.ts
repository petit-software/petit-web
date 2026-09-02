import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

// Crawling is open by design — the per-page `robots` metadata does the fine
// work (see app/(site)/temp/page.tsx). This file only keeps crawlers out of
// what is not a page, and points them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /temp renders the same page as "/", and /api/* are endpoints, not
        // documents. Both are noise in a crawl budget.
        disallow: ["/api/", "/temp"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/"),
  };
}
