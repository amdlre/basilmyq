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
  testimonials: "public:testimonials",
  experience: "public:experience",
  education: "public:education",
  skills: "public:skills",
} as const;

/**
 * Dashboard writes expire these tags immediately, so the time limit only
 * matters for changes made outside the app — restoring a dump into an empty
 * database, say. Without it, "no settings yet" would be cached as the truth and
 * the site would stay on its maintenance screen until the next deploy.
 */
const SETTINGS_REVALIDATE_SECONDS = 60;

export const getSiteSettings = unstable_cache(
  async () => db.siteSetting.findUnique({ where: { id: "singleton" } }),
  ["site-settings"],
  {
    tags: [PUBLIC_TAGS.settings],
    revalidate: SETTINGS_REVALIDATE_SECONDS,
  },
);

export const getHeroSection = unstable_cache(
  async () => db.heroSection.findUnique({ where: { id: "singleton" } }),
  ["hero-section"],
  {
    tags: [PUBLIC_TAGS.settings],
    revalidate: SETTINGS_REVALIDATE_SECONDS,
  },
);

export const getHeroCards = unstable_cache(
  async () =>
    db.heroCard.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ["hero-cards"],
  {
    tags: [PUBLIC_TAGS.settings],
    revalidate: SETTINGS_REVALIDATE_SECONDS,
  },
);

export const getAboutSection = unstable_cache(
  async () => db.aboutSection.findUnique({ where: { id: "singleton" } }),
  ["about-section"],
  {
    tags: [PUBLIC_TAGS.settings],
    revalidate: SETTINGS_REVALIDATE_SECONDS,
  },
);

/**
 * List queries select only what a card needs.
 *
 * The full `content` of every project and post is measured in kilobytes, and
 * shipping it inside the RSC payload of a page that renders titles and
 * summaries bloats every public response. Detail pages use the by-slug queries
 * below, which return everything.
 */
export const getPublicProjects = unstable_cache(
  async () =>
    db.project.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        titleAr: true,
        titleEn: true,
        summaryAr: true,
        summaryEn: true,
        coverUrl: true,
        tags: true,
        year: true,
        categoryId: true,
        isFeatured: true,
        updatedAt: true,
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
      },
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
      select: {
        id: true,
        slug: true,
        titleAr: true,
        titleEn: true,
        excerptAr: true,
        excerptEn: true,
        coverUrl: true,
        tags: true,
        readTimeMinutes: true,
        publishedAt: true,
        views: true,
        updatedAt: true,
      },
    }),
  ["public-posts"],
  { tags: [PUBLIC_TAGS.posts] },
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
