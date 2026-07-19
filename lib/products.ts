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
  /** Absolute public path (e.g. "/images/foo.png"). Falls back to a color block when omitted. */
  image?: string;
  imageAlt?: string;
}

// Registry of sidebar products, in display order.
// Each slug maps to content/products/<slug>.md.
export const productSlugs = [
  "petit-social",
  "petit-pages",
  "petit-mail",
  "petit-analytics",
] as const;

/** Server-only: reads product content files. Call from Server Components and pass down as props. */
export function getProducts(): Product[] {
  return productSlugs.map((id) => {
    const filePath = path.join(process.cwd(), "content/products", `${id}.md`);
    const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));

    for (const field of ["name", "description", "url"] as const) {
      if (!data[field]) {
        throw new Error(`content/products/${id}.md is missing required frontmatter field "${field}"`);
      }
    }

    return {
      id,
      name: data.name,
      description: data.description,
      url: data.url,
      image: data.image,
      imageAlt: data.imageAlt,
      details: content.trim(),
    };
  });
}
