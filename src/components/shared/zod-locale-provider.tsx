"use client";

import { useLocale, useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n/routing";
import { configureZodLocale } from "@/lib/validations/configure-zod";

/**
 * Zod's error map is module-global, so it is set during render rather than in
 * an effect: a form validating on the first pass must already see the right
 * language. Setting it is idempotent and touches no React state.
 */
export function useZodLocale(): void {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Validation");
  configureZodLocale(locale, t);
}
