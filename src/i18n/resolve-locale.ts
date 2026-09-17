import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { type AppLocale, routing } from "./routing";

/**
 * Single entry point for the `[locale]` segment: validates it, narrows `string`
 * to `AppLocale`, and opts the route into static rendering.
 */
export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<AppLocale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  return locale;
}
