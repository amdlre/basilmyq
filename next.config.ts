import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Required by the Coolify Docker image in Phase 7.
  output: "standalone",
  // Pin the workspace root so Turbopack ignores unrelated lockfiles further up the tree.
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
