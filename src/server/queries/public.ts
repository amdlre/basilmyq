import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/server/db";

/**
 * Public reads. Nothing here requires auth, and nothing here returns hidden
 * content: `isVisible` is applied at the query, not in the component.
 *
 * Each query is tagged so a dashboard write can invalidate exactly what it
 * changed (Phase 6 wires `revalidateTag` to these).
 */

export const PUBLIC_TAGS = {
  settings: "public:settings",
  projects: "public:projects",
  posts: "public:posts",
  services: "public:services",
  testimonials: "public:testimonials",
  experience: "public:experience",
  education: "public:education",
  skills: "public:skills",
} as const;

export const getSiteSettings = unstable_cache(
  async () => db.siteSetting.findUnique({ where: { id: "singleton" } }),
  ["site-settings"],
  { tags: [PUBLIC_TAGS.settings] },
);

export const getHeroSection = unstable_cache(
  async () => db.heroSection.findUnique({ where: { id: "singleton" } }),
  ["hero-section"],
  { tags: [PUBLIC_TAGS.settings] },
);

export const getAboutSection = unstable_cache(
  async () => db.aboutSection.findUnique({ where: { id: "singleton" } }),
  ["about-section"],
  { tags: [PUBLIC_TAGS.settings] },
);

export const getPublicProjects = unstable_cache(
  async () =>
    db.project.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
  ["public-projects"],
  { tags: [PUBLIC_TAGS.projects] },
);

export const getPublicProjectCategories = unstable_cache(
  async () =>
    db.projectCategory.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }],
    }),
  ["public-project-categories"],
  { tags: [PUBLIC_TAGS.projects] },
);

export const getPublicPosts = unstable_cache(
  async () =>
    db.post.findMany({
      where: { isVisible: true, publishedAt: { not: null } },
      orderBy: [{ publishedAt: "desc" }],
    }),
  ["public-posts"],
  { tags: [PUBLIC_TAGS.posts] },
);

export const getPublicServices = unstable_cache(
  async () =>
    db.service.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }],
    }),
  ["public-services"],
  { tags: [PUBLIC_TAGS.services] },
);

export const getPublicTestimonials = unstable_cache(
  async () =>
    db.testimonial.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }],
    }),
  ["public-testimonials"],
  { tags: [PUBLIC_TAGS.testimonials] },
);

export const getPublicExperiences = unstable_cache(
  async () =>
    db.experience.findMany({
      where: { isVisible: true },
      orderBy: [{ startDate: "desc" }],
    }),
  ["public-experiences"],
  { tags: [PUBLIC_TAGS.experience] },
);

export const getPublicEducation = unstable_cache(
  async () =>
    db.education.findMany({
      where: { isVisible: true },
      orderBy: [{ startDate: "desc" }],
    }),
  ["public-education"],
  { tags: [PUBLIC_TAGS.education] },
);

export const getPublicSkillGroups = unstable_cache(
  async () =>
    db.skillGroup.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }],
      include: {
        skills: {
          where: { isVisible: true },
          orderBy: [{ order: "asc" }],
        },
      },
    }),
  ["public-skill-groups"],
  { tags: [PUBLIC_TAGS.skills] },
);

/** Detail pages are not cached by slug — they are few and revalidate on write. */
export async function getPublicProjectBySlug(slug: string) {
  return db.project.findFirst({
    where: { slug, isVisible: true },
    include: { category: true },
  });
}

export async function getPublicPostBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, isVisible: true, publishedAt: { not: null } },
  });
}

export type PublicProject = NonNullable<
  Awaited<ReturnType<typeof getPublicProjectBySlug>>
>;
export type PublicPost = NonNullable<
  Awaited<ReturnType<typeof getPublicPostBySlug>>
>;
export type PublicSettings = NonNullable<
  Awaited<ReturnType<typeof getSiteSettings>>
>;
export type PublicSkillGroup = Awaited<
  ReturnType<typeof getPublicSkillGroups>
>[number];
