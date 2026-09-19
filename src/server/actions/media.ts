"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";
import { deleteStoredFiles } from "@/server/uploads";

import type { ActionResult } from "./content";

export async function deleteMedia(ids: string[]): Promise<ActionResult> {
  await requireAuth();
  if (ids.length === 0) return { ok: true };

  const rows = await db.media.findMany({
    where: { id: { in: ids } },
    select: { url: true },
  });
  await db.media.deleteMany({ where: { id: { in: ids } } });
  await deleteStoredFiles(rows.map((row) => row.url));
  revalidatePath("/[locale]/dashboard/media", "page");
  return { ok: true };
}
