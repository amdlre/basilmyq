"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import {
  aboutSectionSchema,
  heroSectionSchema,
  siteSettingSchema,
} from "@/lib/validations/content";
import { db } from "@/server/db";
import { PUBLIC_TAGS } from "@/server/queries/public";
import { fieldErrorsFrom } from "@/server/field-errors";

import type { ActionResult } from "./content";

/**
 * The three singletons. Every string the public site renders is editable here,
 * and every save revalidates the pages that show it.
 */

function revalidatePublicSite(): void {
  // Immediate expiry, so a settings save shows on the site straight away.
  updateTag(PUBLIC_TAGS.settings);
  for (const path of ["", "/projects", "/blog", "/about", "/contact"]) {
    revalidatePath(`/[locale]${path}`, "page");
  }
  revalidatePath("/[locale]", "layout");
}

export async function saveSiteSettings(values: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = siteSettingSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: await fieldErrorsFrom(parsed.error.issues),
    };
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
    return {
      ok: false,
      fieldErrors: await fieldErrorsFrom(parsed.error.issues),
    };
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
    return {
      ok: false,
      fieldErrors: await fieldErrorsFrom(parsed.error.issues),
    };
  }

  await db.aboutSection.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePublicSite();
  return { ok: true };
}
