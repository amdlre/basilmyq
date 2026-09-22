import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Required by the Coolify Docker image: bundles a minimal server plus only
  // the dependencies actually reached.
  output: "standalone",
  // The OG route reads the vendored Arabic font from disk at request time, so
  // tracing cannot discover it — without this the standalone build ships
  // without the font and every share image fails.
  outputFileTracingIncludes: {
    "/api/og": ["./src/assets/fonts/**"],
  },
  // Pin the workspace root so Turbopack ignores unrelated lockfiles further up the tree.
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  typedRoutes: true,
  experimental: {
    // The root layout is `app/[locale]/layout.tsx`, a top-level dynamic
    // segment, so an unmatched URL is answered before any layout renders.
    // This is the documented way to give those a page of our own.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
