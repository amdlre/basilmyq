"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";

import type { ActionResult } from "./content";

/**
 * The inbox is not content: it is never created from the dashboard and has no
 * visibility or ordering, so it gets its own small action set.
 */

function revalidateInbox(): void {
  revalidatePath("/[locale]/dashboard", "layout");
}

/** Called when a message is opened, so the unread badge stays honest. */
export async function markMessageRead(id: string): Promise<ActionResult> {
  await requireAuth();
  await db.contactMessage.update({ where: { id }, data: { isRead: true } });
  revalidateInbox();
  return { ok: true };
}

export async function setMessagesRead(
  ids: string[],
  isRead: boolean,
): Promise<ActionResult> {
  await requireAuth();
  if (ids.length === 0) return { ok: true };
  await db.contactMessage.updateMany({
    where: { id: { in: ids } },
    data: { isRead },
  });
  revalidateInbox();
  return { ok: true };
}

export async function setMessagesArchived(
  ids: string[],
  isArchived: boolean,
): Promise<ActionResult> {
  await requireAuth();
  if (ids.length === 0) return { ok: true };
  await db.contactMessage.updateMany({
    where: { id: { in: ids } },
    // Archiving also marks read: an archived message is no longer pending.
    data: { isArchived, ...(isArchived ? { isRead: true } : {}) },
  });
  revalidateInbox();
  return { ok: true };
}

export async function deleteMessages(ids: string[]): Promise<ActionResult> {
  await requireAuth();
  if (ids.length === 0) return { ok: true };
  await db.contactMessage.deleteMany({ where: { id: { in: ids } } });
  revalidateInbox();
  return { ok: true };
}
