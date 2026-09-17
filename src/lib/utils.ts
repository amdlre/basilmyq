export { cn } from "cn";

/**
 * URL-safe slug. Arabic letters are kept as-is (they are valid in modern URLs
 * and readable when encoded), while spaces and punctuation collapse to dashes.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[̀-ͯ]/g, "")
    .replaceAll(/[^\p{L}\p{N}]+/gu, "-")
    .replaceAll(/^-+|-+$/g, "");
}
