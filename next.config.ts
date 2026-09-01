import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Declaring localPatterns replaces the default, so every local image src
    // has to be covered here or the build rejects it while prerendering.
    //
    // Product media carries a ?v=<content hash> (see lib/products.ts) so that
    // replacing artwork changes the URL. Next rejects query strings on local
    // images unless a pattern permits them, and permitting them means omitting
    // `search` entirely — `search: ""` allows only URLs with no query at all,
    // which is the opposite of what is needed.
    localPatterns: [
      { pathname: "/products/**" },
      { pathname: "/blog/**", search: "" },
      { pathname: "/images/**", search: "" },
    ],
  },
  // Product media carries a ?v=<content hash> in its URL, so replacing a file
  // changes the URL and a held copy can never go stale — which makes these
  // safe to freeze. Without it the raw files under /public go out as
  // max-age=0, so every clip is revalidated each time a tile picks it back up
  // and the intro's preloading buys nothing. Stills escape this by going
  // through /_next/image, which sets its own four-hour TTL.
  async headers() {
    return [
      {
        source: "/products/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
