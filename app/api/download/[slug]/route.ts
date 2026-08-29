import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

// GitHub's static /releases/latest/download/<file> shortcut only works when the
// asset filename is stable across releases. Clio's assets embed the version
// (Clio-0.61.dmg), so the latest asset has to be resolved at request time.
const RELEASE_CACHE_SECONDS = 300;
// Preference order when a release ships several artifacts.
const PREFERRED_EXTENSIONS = [".dmg", ".pkg", ".zip"];

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

function pickAsset(assets: ReleaseAsset[]): ReleaseAsset | undefined {
  for (const extension of PREFERRED_EXTENSIONS) {
    const match = assets.find((asset) => asset.name.toLowerCase().endsWith(extension));
    if (match) return match;
  }
  return assets[0];
}

/**
 * Redirects to the newest release asset for a product's repo.
 *
 * The repo is looked up from the product's own frontmatter by slug rather than
 * taken from the URL, so this can never be pointed at an arbitrary host.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = getProducts().find((candidate) => candidate.id === slug);

  if (!product?.github) {
    return NextResponse.json({ error: "No download available for this product." }, { status: 404 });
  }

  const response = await fetch(
    `https://api.github.com/repos/${product.github}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        // Unauthenticated calls are rate-limited per IP; the revalidate below
        // keeps this to roughly one call per interval per deployment.
        "User-Agent": "petit-web",
      },
      next: { revalidate: RELEASE_CACHE_SECONDS },
    },
  );

  if (!response.ok) {
    // Fall back to the releases page rather than dead-ending the click.
    return NextResponse.redirect(`https://github.com/${product.github}/releases/latest`, 302);
  }

  const release = (await response.json()) as { assets?: ReleaseAsset[] };
  const asset = pickAsset(release.assets ?? []);

  return NextResponse.redirect(
    asset?.browser_download_url ?? `https://github.com/${product.github}/releases/latest`,
    302,
  );
}
