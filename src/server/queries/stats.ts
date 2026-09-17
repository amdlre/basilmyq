import "server-only";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";

/** The numbers shown above each module's table. */

export async function getProjectStats() {
  await requireAuth();
  const [total, visible, featured] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { isVisible: true } }),
    db.project.count({ where: { isFeatured: true } }),
  ]);
  return { total, visible, hidden: total - visible, featured };
}

export async function getPostStats() {
  await requireAuth();
  const [total, published, views] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { publishedAt: { not: null } } }),
    db.post.aggregate({ _sum: { views: true } }),
  ]);
  return {
    total,
    published,
    drafts: total - published,
    views: views._sum.views ?? 0,
  };
}

export async function getServiceStats() {
  await requireAuth();
  const [total, visible] = await Promise.all([
    db.service.count(),
    db.service.count({ where: { isVisible: true } }),
  ]);
  return { total, visible, hidden: total - visible };
}

export async function getTestimonialStats() {
  await requireAuth();
  const [total, visible, rating] = await Promise.all([
    db.testimonial.count(),
    db.testimonial.count({ where: { isVisible: true } }),
    db.testimonial.aggregate({ _avg: { rating: true } }),
  ]);
  return {
    total,
    visible,
    averageRating: Math.round((rating._avg.rating ?? 0) * 10) / 10,
  };
}

export async function getExperienceStats() {
  await requireAuth();
  const [total, current, earliest] = await Promise.all([
    db.experience.count(),
    db.experience.count({ where: { isCurrent: true } }),
    db.experience.findFirst({ orderBy: { startDate: "asc" } }),
  ]);

  const years = earliest
    ? Math.max(
        0,
        new Date().getFullYear() - new Date(earliest.startDate).getFullYear(),
      )
    : 0;

  return { total, current, years };
}

export async function getEducationStats() {
  await requireAuth();
  const [degrees, certificates] = await Promise.all([
    db.education.count({ where: { type: "DEGREE" } }),
    db.education.count({ where: { type: "CERTIFICATE" } }),
  ]);
  return { degrees, certificates, total: degrees + certificates };
}

export async function getSkillStats() {
  await requireAuth();
  const [total, groups, featured] = await Promise.all([
    db.skill.count(),
    db.skillGroup.count(),
    db.skill.count({ where: { isFeatured: true } }),
  ]);
  return { total, groups, featured };
}

export async function getMessageStats() {
  await requireAuth();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, today, archived] = await Promise.all([
    db.contactMessage.count(),
    db.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    db.contactMessage.count({ where: { createdAt: { gte: startOfToday } } }),
    db.contactMessage.count({ where: { isArchived: true } }),
  ]);
  return { total, unread, today, archived };
}

export async function getMediaStats() {
  await requireAuth();
  const [total, size, images] = await Promise.all([
    db.media.count(),
    db.media.aggregate({ _sum: { size: true } }),
    db.media.count({ where: { mimeType: { startsWith: "image/" } } }),
  ]);
  return {
    total,
    bytes: size._sum.size ?? 0,
    images,
    files: total - images,
  };
}

export async function getOverviewStats() {
  await requireAuth();
  const [projects, posts, unread, views, recentMessages, activity] =
    await Promise.all([
      db.project.count(),
      db.post.count({ where: { publishedAt: { not: null } } }),
      db.contactMessage.count({ where: { isRead: false, isArchived: false } }),
      db.post.aggregate({ _sum: { views: true } }),
      db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  return {
    projects,
    posts,
    unread,
    views: views._sum.views ?? 0,
    recentMessages,
    activity,
  };
}
