import "server-only";

import type { ZodType } from "zod";

import type { Prisma } from "@/generated/prisma/client";

import {
  educationSchema,
  experienceSchema,
  postSchema,
  projectCategorySchema,
  projectSchema,
  serviceSchema,
  skillGroupSchema,
  skillSchema,
  testimonialSchema,
} from "@/lib/validations/content";
import { db } from "@/server/db";

/**
 * A minimal structural view of a Prisma delegate. Typing the registry against
 * this instead of each concrete delegate is what lets one set of Server Actions
 * serve every module, without reaching for `any`.
 */
type ContentDelegate = {
  create(args: {
    data: Record<string, unknown>;
  }): Prisma.PrismaPromise<{ id: string }>;
  update(args: {
    where: { id: string };
    data: Record<string, unknown>;
  }): Prisma.PrismaPromise<{ id: string }>;
  delete(args: { where: { id: string } }): Prisma.PrismaPromise<unknown>;
  deleteMany(args: {
    where: { id: { in: string[] } };
  }): Prisma.PrismaPromise<unknown>;
  updateMany(args: {
    where: { id: { in: string[] } };
    data: Record<string, unknown>;
  }): Prisma.PrismaPromise<unknown>;
  findUnique(args: { where: { id: string } }): Prisma.PrismaPromise<unknown>;
};

type ContentConfig = {
  delegate: ContentDelegate;
  schema: ZodType<Record<string, unknown>, Record<string, unknown>>;
  /** Public paths to revalidate after a write. */
  paths: string[];
  /** Fields cleared when duplicating, because they must stay unique. */
  uniqueFields?: string[];
  supportsVisibility: boolean;
  supportsFeatured: boolean;
};

/**
 * The single registry of writable content. Server Actions accept an entity name
 * and look it up here, so an unknown name can never reach the database.
 */
export const CONTENT_ENTITIES = {
  project: {
    delegate: db.project as unknown as ContentDelegate,
    schema: projectSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/projects"],
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  projectCategory: {
    delegate: db.projectCategory as unknown as ContentDelegate,
    schema: projectCategorySchema as unknown as ContentConfig["schema"],
    paths: ["/", "/projects"],
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: false,
  },
  post: {
    delegate: db.post as unknown as ContentDelegate,
    schema: postSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/blog"],
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  service: {
    delegate: db.service as unknown as ContentDelegate,
    schema: serviceSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  testimonial: {
    delegate: db.testimonial as unknown as ContentDelegate,
    schema: testimonialSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  experience: {
    delegate: db.experience as unknown as ContentDelegate,
    schema: experienceSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/about"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  education: {
    delegate: db.education as unknown as ContentDelegate,
    schema: educationSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/about"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  skill: {
    delegate: db.skill as unknown as ContentDelegate,
    schema: skillSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  skillGroup: {
    delegate: db.skillGroup as unknown as ContentDelegate,
    schema: skillGroupSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    supportsVisibility: true,
    supportsFeatured: false,
  },
} as const satisfies Record<string, ContentConfig>;

export type ContentEntity = keyof typeof CONTENT_ENTITIES;

export function isContentEntity(value: string): value is ContentEntity {
  return Object.hasOwn(CONTENT_ENTITIES, value);
}

export function getContentConfig(entity: ContentEntity): ContentConfig {
  return CONTENT_ENTITIES[entity];
}
