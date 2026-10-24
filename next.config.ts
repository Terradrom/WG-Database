import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build so the app can run in Docker on our own server later.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
