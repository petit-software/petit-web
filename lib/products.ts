import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Long-form text shown in the product modal (markdown body of the content file). */
  details: string;
  url: string;
  /** Public URL for the folder's cover.<ext> file, if one exists. Falls back to a color block when omitted. */
  image?: string;
  /** Public URL for the folder's detail.<ext> file — the wider image shown in the drawer.
   *  Falls back to the cover when the folder has no detail image of its own. */
  detailImage?: string;
  imageAlt?: string;
  /** "owner/repo" for an open-source product. Drives the GitHub link and the
   *  latest-release download button. */
  github?: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "products");
const COVER_BASENAME = "cover";
const DETAIL_BASENAME = "detail";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

// A product's images are just cover.<ext> / detail.<ext> sitting next to its
// index.md — no frontmatter field to fill in, just name the file and it's
// picked up. cover is the ticker tile, detail is the drawer.
function findImage(dir: string, basename: string): string | undefined {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const match = entries.find((entry) => {
    if (!entry.isFile()) return false;
    const ext = path.extname(entry.name).toLowerCase();
    const base = path.basename(entry.name, ext).toLowerCase();
    return base === basename && IMAGE_EXTENSIONS.includes(ext);
  });
  return match?.name;
}

/**
 * Server-only: discovers every content/products/<slug>/ folder — each holding
 * an index.md plus an optional cover.<ext> image — and reads it as a Product.
 * Adding a new folder makes it show up automatically; nothing to register.
 */
export function getProducts(): Product[] {
  const slugs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return slugs.map((id) => {
    const dir = path.join(CONTENT_ROOT, id);
    const filePath = path.join(dir, "index.md");
    const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));

    for (const field of ["name", "description", "url"] as const) {
      if (!data[field]) {
        throw new Error(`content/products/${id}/index.md is missing required frontmatter field "${field}"`);
      }
    }

    const coverFile = findImage(dir, COVER_BASENAME);
    const detailFile = findImage(dir, DETAIL_BASENAME);
    const cover = coverFile ? `/products/${id}/${coverFile}` : undefined;

    return {
      id,
      name: data.name,
      description: data.description,
      url: data.url,
      image: cover,
      detailImage: detailFile ? `/products/${id}/${detailFile}` : cover,
      imageAlt: data.imageAlt,
      github: data.github,
      details: content.trim(),
    };
  });
}
