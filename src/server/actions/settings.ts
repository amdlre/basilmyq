"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import {
  aboutSectionSchema,
  heroSectionSchema,
  siteSettingSchema,
} from "@/lib/validations/content";
import { db } from "@/server/db";

import type { ActionResult } from "./content";

/**
 * The three singletons. Every string the public site renders is editable here,
 * and every save revalidates the pages that show it.
 */

function fieldErrorsFrom(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function revalidatePublicSite(): void {
  for (const path of ["", "/projects", "/blog", "/about", "/contact"]) {
    revalidatePath(`/[locale]${path}`, "page");
  }
  revalidatePath("/[locale]", "layout");
}

export async function saveSiteSettings(values: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = siteSettingSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await db.siteSetting.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePublicSite();
  return { ok: true };
}

export async function saveHeroSection(values: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = heroSectionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await db.heroSection.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePublicSite();
  return { ok: true };
}

export async function saveAboutSection(values: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = aboutSectionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await db.aboutSection.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePublicSite();
  return { ok: true };
}
