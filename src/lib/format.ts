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
