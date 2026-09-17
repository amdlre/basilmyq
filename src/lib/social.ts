import type { SocialLink } from "@/components/public/social-links";

/** `socialLinks` is a Json column; this is the one place it is narrowed. */
export function readSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (
      typeof record.label !== "string" ||
      typeof record.url !== "string" ||
      typeof record.icon !== "string"
    ) {
      return [];
    }
    return [{ label: record.label, url: record.url, icon: record.icon }];
  });
}
