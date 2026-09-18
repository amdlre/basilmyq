import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin surface and the internal API must never be indexed.
      disallow: [
        "/api/",
        "/ar/dashboard",
        "/en/dashboard",
        "/ar/login",
        "/en/login",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
