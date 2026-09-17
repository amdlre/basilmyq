import { defineRouting } from "next-intl/routing";

export const LOCALES = ["ar", "en"] as const;
export const DEFAULT_LOCALE = "ar";

export type AppLocale = (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

export function getLocaleDirection(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
