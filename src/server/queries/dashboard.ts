import "server-only";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";

/**
 * Dashboard reads. Every one starts with `requireAuth()` — the proxy redirect is
 * a convenience, this is the boundary.
 */

const byOrder = [{ order: "asc" }, { createdAt: "desc" }] as const;

export async function getProjects() {
  await requireAuth();
  return db.project.findMany({
    orderBy: [...byOrder],
    include: { category: true },
  });
}

export async function getProjectCategories() {
  await requireAuth();
  return db.projectCategory.findMany({ orderBy: [...byOrder] });
}

export async function getPosts() {
  await requireAuth();
  return db.post.findMany({ orderBy: [...byOrder] });
}

export async function getServices() {
  await requireAuth();
  return db.service.findMany({ orderBy: [...byOrder] });
}

export async function getTestimonials() {
  await requireAuth();
  return db.testimonial.findMany({ orderBy: [...byOrder] });
}

export async function getExperiences() {
  await requireAuth();
  return db.experience.findMany({ orderBy: [{ startDate: "desc" }] });
}

export async function getEducation() {
  await requireAuth();
  return db.education.findMany({ orderBy: [{ startDate: "desc" }] });
}

export async function getSkills() {
  await requireAuth();
  return db.skill.findMany({ orderBy: [...byOrder], include: { group: true } });
}

export async function getSkillGroups() {
  await requireAuth();
  return db.skillGroup.findMany({ orderBy: [...byOrder] });
}

export async function getMessages() {
  await requireAuth();
  return db.contactMessage.findMany({ orderBy: [{ createdAt: "desc" }] });
}

export async function getMedia() {
  await requireAuth();
  return db.media.findMany({ orderBy: [{ createdAt: "desc" }] });
}

export type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
export type PostRow = Awaited<ReturnType<typeof getPosts>>[number];
export type ServiceRow = Awaited<ReturnType<typeof getServices>>[number];
export type TestimonialRow = Awaited<
  ReturnType<typeof getTestimonials>
>[number];
export type ExperienceRow = Awaited<ReturnType<typeof getExperiences>>[number];
export type EducationRow = Awaited<ReturnType<typeof getEducation>>[number];
export type SkillRow = Awaited<ReturnType<typeof getSkills>>[number];
export type SkillGroupRow = Awaited<ReturnType<typeof getSkillGroups>>[number];
export type MessageRow = Awaited<ReturnType<typeof getMessages>>[number];
export type MediaRow = Awaited<ReturnType<typeof getMedia>>[number];
export type ProjectCategoryRow = Awaited<
  ReturnType<typeof getProjectCategories>
>[number];

/** The three singletons, created on first read so settings always have a row. */
export async function getSingletons() {
  await requireAuth();

  const [settings, hero, about] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: "singleton" } }),
    db.heroSection.findUnique({ where: { id: "singleton" } }),
    db.aboutSection.findUnique({ where: { id: "singleton" } }),
  ]);

  return { settings, hero, about };
}
