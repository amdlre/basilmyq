import type { AppLocale } from "@/i18n/routing";

/**
 * Picks the field matching the active locale from a record that stores both.
 * Every bilingual model in the database follows the `<field>Ar` / `<field>En`
 * convention, so one helper covers all of them.
 */
export function pick<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: AppLocale,
): string {
  const key = `${field}${locale === "ar" ? "Ar" : "En"}`;
  const value = row[key];
  return typeof value === "string" ? value : "";
}

/** Same, but returns null for empty optional fields. */
export function pickOptional<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: AppLocale,
): string | null {
  const value = pick(row, field, locale);
  return value === "" ? null : value;
}
