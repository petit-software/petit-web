import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { getLandingSlugs } from "@/lib/landing-pages";
import { landingSourcePath } from "@/lib/markdown";
import { siteUrl } from "@/lib/metadata";

// `changeFrequency` and `priority` are deliberately omitted: Google has said
// outright that it ignores both. `lastModified` is the only hint it acts on,
// so it is taken from the file that actually produces each page rather than
// stamped with the build time — a sitemap that claims every page changed on
// every deploy teaches a crawler to distrust the field.
function modifiedAt(...candidates: string[]): Date {
  const times = candidates
    .map((file) => {
      try {
        return fs.statSync(file).mtimeMs;
      } catch {
        return 0;
      }
    })
    .filter(Boolean);

  return times.length ? new Date(Math.max(...times)) : new Date();
}

const fromRoot = (...segments: string[]) => path.join(process.cwd(), ...segments);

/** The home page is the product belt, so it is as old as the newest product. */
function productsModifiedAt(): Date {
  const root = fromRoot("content", "products");
  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name, "index.md"));

  return modifiedAt(...files);
}

// Only indexable routes belong here. /temp is a duplicate of "/" and carries
// noindex; the API routes are not pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl("/"),
      lastModified: productsModifiedAt(),
    },
    {
      url: siteUrl("/clarity"),
      lastModified: modifiedAt(fromRoot("app", "clarity", "page.tsx")),
    },
    ...getLandingSlugs().map((slug) => ({
      url: siteUrl(`/${slug}`),
      lastModified: modifiedAt(landingSourcePath(slug)),
    })),
  ];
}
