import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is entirely dynamic and database-backed (one DB read per request),
  // so Cache Components' prerendering adds nothing and its shell-prerender races
  // the Turso fetch during build. Render everything at request time instead.
  cacheComponents: false,
  // Pin the workspace root so Next doesn't pick up a stray package-lock.json
  // from a parent directory.
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
