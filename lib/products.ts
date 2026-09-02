import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Long-form text shown in the product modal (markdown body of the content file). */
  details: string;
  /** Where the product's button points. Optional: a product that has nothing
   *  to link to yet simply gets no button in its drawer. */
  url?: string;
  /** Public URL for the folder's cover.<ext> file, if one exists. Falls back to a color block when omitted. */
  image?: string;
  /** Public URL for the folder's detail.<ext> file — the wider image shown in the drawer.
   *  Falls back to the cover when the folder has no detail image of its own. */
  detailImage?: string;
  imageAlt?: string;
  /** "owner/repo" for an open-source product. Drives the GitHub link and the
   *  latest-release download button. */
  github?: string;
  /** Optional short label shown in the tile's top-right corner, e.g.
   *  "Open-Source" or "Partnership". */
  tag?: string;
  /** How the cover fills the tile's box. Defaults to "contain", which shows
   *  the whole frame; "cover" fills the tile and crops. Worth setting when the
   *  cover's aspect does not match the tile's — a 16:9 clip in a square box
   *  letterboxes under "contain" and fills under "cover". */
  coverFit?: "cover" | "contain";
  /** Which part of the cover survives when "cover" crops it. Defaults to
   *  centre, which is wrong whenever the subject sits off-centre. */
  coverPosition?: "center" | "top" | "bottom" | "left" | "right";
  /** "overlay" spreads the cover across the whole tile and floats the title
   *  and description over its foot. Defaults to "standard", which stacks the
   *  cover above the text. Both are the same height, so a belt can mix them. */
  tileLayout?: "standard" | "overlay";
  /** "ascii" paints a live animated ASCII field behind the tile's contents,
   *  in place of a flat card. Defaults to none. */
  tileBackground?: "ascii";
  /** Position in the ticker. Products without one sort after those with one,
   *  alphabetically by slug. */
  order?: number;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "products");
const COVER_BASENAME = "cover";
const DETAIL_BASENAME = "detail";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];
const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

// A product's media is just cover.<ext> / detail.<ext> sitting next to its
// index.md — no frontmatter field to fill in, just name the file and it's
// picked up. cover is the ticker tile, detail is the drawer. Either may be a
// still or a short video; the renderer branches on the extension.
function findMedia(dir: string, basename: string): string | undefined {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const match = entries.find((entry) => {
    if (!entry.isFile()) return false;
    const ext = path.extname(entry.name).toLowerCase();
    const base = path.basename(entry.name, ext).toLowerCase();
    return base === basename && MEDIA_EXTENSIONS.includes(ext);
  });
  return match?.name;
}

// Product image URLs are stable across edits — same slug, same cover.<ext> —
// so swapping the artwork leaves browsers (and the image optimizer) serving
// the previous file from cache. Tagging the URL with a hash of the contents
// makes a new image a new URL, and an unchanged one keep its cache.
function fingerprint(filePath: string): string {
  return crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex").slice(0, 8);
}

function publicImageUrl(id: string, dir: string, file: string): string {
  return `/products/${id}/${file}?v=${fingerprint(path.join(dir, file))}`;
}

/**
 * Server-only: discovers every content/products/<slug>/ folder — each holding
 * an index.md plus optional cover/detail media — and reads it as a Product.
 * Adding a new folder makes it show up automatically; nothing to register.
 *
 * Ordering is by the optional `order` frontmatter field, then by slug, so a
 * product can be positioned without renaming its folder — the slug is baked
 * into its media URLs.
 */
export function getProducts(): Product[] {
  const slugs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const products = slugs.map((id) => {
    const dir = path.join(CONTENT_ROOT, id);
    const filePath = path.join(dir, "index.md");
    const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));

    for (const field of ["name", "description"] as const) {
      if (!data[field]) {
        throw new Error(`content/products/${id}/index.md is missing required frontmatter field "${field}"`);
      }
    }

    const coverFit = data.coverFit;
    if (coverFit !== undefined && coverFit !== "cover" && coverFit !== "contain") {
      throw new Error(
        `content/products/${id}/index.md has an invalid "coverFit" (${coverFit}); expected "cover" or "contain"`,
      );
    }

    const order = data.order;
    if (order !== undefined && typeof order !== "number") {
      throw new Error(
        `content/products/${id}/index.md has a non-numeric "order" (${order})`,
      );
    }

    const coverPosition = data.coverPosition;
    if (
      coverPosition !== undefined &&
      !["center", "top", "bottom", "left", "right"].includes(coverPosition)
    ) {
      throw new Error(
        `content/products/${id}/index.md has an invalid "coverPosition" (${coverPosition}); expected center, top, bottom, left or right`,
      );
    }

    const tileLayout = data.tileLayout;
    if (tileLayout !== undefined && tileLayout !== "standard" && tileLayout !== "overlay") {
      throw new Error(
        `content/products/${id}/index.md has an invalid "tileLayout" (${tileLayout}); expected "standard" or "overlay"`,
      );
    }

    const tileBackground = data.tileBackground;
    if (tileBackground !== undefined && tileBackground !== "ascii") {
      throw new Error(
        `content/products/${id}/index.md has an invalid "tileBackground" (${tileBackground}); expected "ascii"`,
      );
    }

    const coverFile = findMedia(dir, COVER_BASENAME);
    const detailFile = findMedia(dir, DETAIL_BASENAME);
    const cover = coverFile ? publicImageUrl(id, dir, coverFile) : undefined;

    return {
      id,
      name: data.name,
      description: data.description,
      url: data.url,
      image: cover,
      detailImage: detailFile ? publicImageUrl(id, dir, detailFile) : cover,
      imageAlt: data.imageAlt,
      github: data.github,
      tag: data.tag,
      coverFit,
      coverPosition,
      tileLayout,
      tileBackground,
      order,
      details: content.trim(),
    };
  });

  return products.sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
      a.id.localeCompare(b.id),
  );
}
