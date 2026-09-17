/** Human-readable byte size, locale-aware for the digits. */
export function formatBytes(bytes: number, locale: string): string {
  if (bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })} ${units[exponent]}`;
}

/**
 * Revives a date that came back from a cached query.
 *
 * `unstable_cache` serialises its result, so `Date` fields arrive as ISO
 * strings. Every date read from `server/queries/public.ts` must pass through
 * here before it is formatted, or `Intl` throws "Invalid time value".
 */
export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
