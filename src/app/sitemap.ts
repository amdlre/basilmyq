import type { MetadataRoute } from "next";

import { LOCALES } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { getPublicPosts, getPublicProjects } from "@/server/queries/public";

// Built per request (its queries are cached), so `next build` never needs the
// database. See the `[locale]` layout.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["", "/projects", "/blog", "/about", "/contact"];

/**
 * Only content that is actually public appears here: the queries already
 * exclude hidden rows and unpublished posts, so nothing leaks through.
 * Each entry carries alternates so both locales are discoverable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getPublicProjects(),
    getPublicPosts(),
  ]);

  const entry = (
    path: string,
    lastModified?: Date,
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(`/ar${path}`),
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, absoluteUrl(`/${locale}${path}`)]),
      ),
    },
  });

  return [
    ...STATIC_PATHS.map((path) => entry(path)),
    ...projects.map((project) =>
      entry(`/projects/${project.slug}`, new Date(project.updatedAt)),
    ),
    ...posts.map((post) =>
      entry(`/blog/${post.slug}`, new Date(post.updatedAt)),
    ),
  ];
}
