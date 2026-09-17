"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";

import type { ActionResult } from "./content";

export async function deleteMedia(ids: string[]): Promise<ActionResult> {
  await requireAuth();
  if (ids.length === 0) return { ok: true };

  // Only the library row is removed here; the stored file is cleaned up when
  // uploads get a real backing store in Phase 7.
  await db.media.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/[locale]/dashboard/media", "page");
  return { ok: true };
}
