import { z } from "zod";

import type { AppLocale } from "@/i18n/routing";

/**
 * Points Zod's built-in error messages at the active locale, so validation
 * text obeys rule 7 (no hardcoded UI strings) without every schema having to
 * spell out a message for each constraint.
 *
 * Schemas still override individual messages where the default is too vague.
 */
export function configureZodLocale(locale: AppLocale): void {
  z.config(locale === "ar" ? z.locales.ar() : z.locales.en());
}
