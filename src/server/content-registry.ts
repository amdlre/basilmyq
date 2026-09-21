import "server-only";

import type { ZodType } from "zod";

import type { Prisma } from "@/generated/prisma/client";

import {
  educationSchema,
  heroCardSchema,
  experienceSchema,
  postSchema,
  projectCategorySchema,
  projectSchema,
  skillGroupSchema,
  skillSchema,
  tagSchema,
} from "@/lib/validations/content";
import { db } from "@/server/db";
import { PUBLIC_TAGS } from "@/server/queries/public";

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
  /** Cache tag of the public query this model feeds, if it feeds one. */
  tag?: string;
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
    tag: PUBLIC_TAGS.projects,
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  projectCategory: {
    delegate: db.projectCategory as unknown as ContentDelegate,
    schema: projectCategorySchema as unknown as ContentConfig["schema"],
    paths: ["/", "/projects"],
    tag: PUBLIC_TAGS.projects,
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: false,
  },
  post: {
    delegate: db.post as unknown as ContentDelegate,
    schema: postSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/blog"],
    tag: PUBLIC_TAGS.posts,
    uniqueFields: ["slug"],
    supportsVisibility: true,
    supportsFeatured: true,
  },
  experience: {
    delegate: db.experience as unknown as ContentDelegate,
    schema: experienceSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/about"],
    tag: PUBLIC_TAGS.experience,
    supportsVisibility: true,
    supportsFeatured: true,
  },
  education: {
    delegate: db.education as unknown as ContentDelegate,
    schema: educationSchema as unknown as ContentConfig["schema"],
    paths: ["/", "/about"],
    tag: PUBLIC_TAGS.education,
    supportsVisibility: true,
    supportsFeatured: true,
  },
  skill: {
    delegate: db.skill as unknown as ContentDelegate,
    schema: skillSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    tag: PUBLIC_TAGS.skills,
    supportsVisibility: true,
    supportsFeatured: true,
  },
  skillGroup: {
    delegate: db.skillGroup as unknown as ContentDelegate,
    schema: skillGroupSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    tag: PUBLIC_TAGS.skills,
    supportsVisibility: true,
    supportsFeatured: false,
  },
  heroCard: {
    delegate: db.heroCard as unknown as ContentDelegate,
    schema: heroCardSchema as unknown as ContentConfig["schema"],
    paths: ["/"],
    tag: PUBLIC_TAGS.settings,
    supportsVisibility: true,
    supportsFeatured: false,
  },
  tag: {
    delegate: db.tag as unknown as ContentDelegate,
    schema: tagSchema as unknown as ContentConfig["schema"],
    // Dashboard-only: tag suggestions never reach the public site.
    paths: [],
    uniqueFields: ["name"],
    supportsVisibility: false,
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
