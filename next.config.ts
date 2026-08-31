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
};

export default nextConfig;
