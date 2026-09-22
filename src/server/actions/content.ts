"use server";

import { revalidatePath, updateTag } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  type ContentEntity,
  getContentConfig,
  isContentEntity,
} from "@/server/content-registry";
import { db } from "@/server/db";
import { fieldErrorsFrom } from "@/server/field-errors";

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Every write in the dashboard goes through this file.
 *
 * Each action starts with `requireAuth()` and resolves the target model through
 * the registry, so an unknown entity name can never reach the database.
 */

function assertEntity(entity: string): ContentEntity {
  if (!isContentEntity(entity)) {
    throw new Error(`Unknown content entity: ${entity}`);
  }
  return entity;
}

async function revalidateFor(entity: ContentEntity): Promise<void> {
  const { paths, tag } = getContentConfig(entity);

  // `updateTag`, not `revalidateTag`: it expires the tag immediately so the
  // next request waits for fresh data instead of being served the stale copy.
  // That is what makes a dashboard edit visible on the site straight away.
  if (tag) updateTag(tag);
  for (const path of paths) {
    revalidatePath(`/[locale]${path === "/" ? "" : path}`, "page");
  }
  revalidatePath("/[locale]/dashboard", "layout");
}

async function log(
  action: string,
  entity: string,
  entityId?: string,
  meta?: Prisma.InputJsonValue,
): Promise<void> {
  await db.activityLog.create({
    data: { action, entity, entityId: entityId ?? null, meta: meta ?? {} },
  });
}

/** Create when `id` is null, update otherwise. */
export async function upsertContent(
  entityName: string,
  id: string | null,
  values: unknown,
): Promise<ActionResult> {
  await requireAuth();
  const entity = assertEntity(entityName);
  const { delegate, schema } = getContentConfig(entity);

  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    // Field errors are returned to the form rather than thrown.
    return {
      ok: false,
      fieldErrors: await fieldErrorsFrom(parsed.error.issues),
    };
  }

  try {
    const record = id
      ? await delegate.update({ where: { id }, data: parsed.data })
      : await delegate.create({ data: parsed.data });

    await log(id ? "update" : "create", entity, record.id);
    await revalidateFor(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: describeWriteError(error) };
  }
}

export async function deleteContent(
  entityName: string,
  ids: string[],
): Promise<ActionResult> {
  await requireAuth();
  const entity = assertEntity(entityName);
  const { delegate } = getContentConfig(entity);

  if (ids.length === 0) return { ok: true };

  try {
    await delegate.deleteMany({ where: { id: { in: ids } } });
    await log("delete", entity, undefined, { ids });
    await revalidateFor(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: describeWriteError(error) };
  }
}

export async function setContentFlag(
  entityName: string,
  ids: string[],
  field: "isVisible" | "isFeatured",
  value: boolean,
): Promise<ActionResult> {
  await requireAuth();
  const entity = assertEntity(entityName);
  const config = getContentConfig(entity);

  if (field === "isVisible" && !config.supportsVisibility) {
    return { ok: false, message: "Unsupported field." };
  }
  if (field === "isFeatured" && !config.supportsFeatured) {
    return { ok: false, message: "Unsupported field." };
  }
  if (ids.length === 0) return { ok: true };

  try {
    await config.delegate.updateMany({
      where: { id: { in: ids } },
      data: { [field]: value },
    });
    await log("flag", entity, undefined, { ids, field, value });
    await revalidateFor(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: describeWriteError(error) };
  }
}

/** Writes the dropped order back as sequential `order` values. */
export async function reorderContent(
  entityName: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAuth();
  const entity = assertEntity(entityName);
  const { delegate } = getContentConfig(entity);

  try {
    await db.$transaction(
      orderedIds.map((id, index) =>
        delegate.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    await log("reorder", entity, undefined, { count: orderedIds.length });
    await revalidateFor(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: describeWriteError(error) };
  }
}

/** Copies a record, hidden, with unique fields suffixed so they stay unique. */
export async function duplicateContent(
  entityName: string,
  id: string,
): Promise<ActionResult> {
  await requireAuth();
  const entity = assertEntity(entityName);
  const { delegate, uniqueFields = [] } = getContentConfig(entity);

  try {
    const source = await delegate.findUnique({ where: { id } });
    if (!source || typeof source !== "object") {
      return { ok: false, message: "Not found." };
    }

    const copy: Record<string, unknown> = { ...source };
    delete copy.id;
    delete copy.createdAt;
    delete copy.updatedAt;

    const suffix = `-copy-${Date.now().toString(36)}`;
    for (const field of uniqueFields) {
      if (typeof copy[field] === "string")
        copy[field] = `${copy[field]}${suffix}`;
    }

    // A duplicate always starts hidden, so a half-edited copy never goes live.
    if ("isVisible" in copy) copy.isVisible = false;
    if ("isFeatured" in copy) copy.isFeatured = false;

    const created = await delegate.create({ data: copy });
    await log("duplicate", entity, created.id, { from: id });
    await revalidateFor(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: describeWriteError(error) };
  }
}

/** Turns Prisma's unique-constraint failure into something a human can act on. */
function describeWriteError(error: unknown): string | undefined {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return "DUPLICATE";
  }
  return undefined;
}
