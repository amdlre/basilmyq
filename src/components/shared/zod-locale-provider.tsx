"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";

import type { AppLocale } from "@/i18n/routing";
import { configureZodLocale } from "@/lib/validations/configure-zod";

/**
 * Zod's error map is module-global, so it is set during render rather than in
 * an effect: a form validating on the first pass must already see the right
 * language. Setting it is idempotent and touches no React state.
 */
export function ZodLocaleProvider({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  configureZodLocale(locale);
  return children;
}

export function useZodLocale(): void {
  const locale = useLocale() as AppLocale;
  configureZodLocale(locale);
}
