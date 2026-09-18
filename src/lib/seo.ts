import type { Metadata } from "next";

import { LOCALES, type AppLocale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

type BuildMetadataOptions = {
  locale: AppLocale;
  title: string;
  description: string;
  /** Path without the locale prefix, e.g. `/projects/slug`. */
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date | string | null;
  tags?: string[];
  noIndex?: boolean;
  siteName?: string;
};

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** `/ar/projects` for every locale, so hreflang stays in one place. */
function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, absoluteUrl(`/${locale}${path}`)]),
  );
}

/** Every page's metadata is built here, so canonical and hreflang never drift. */
export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  image,
  type = "website",
  publishedTime,
  tags,
  noIndex = false,
  siteName,
}: BuildMetadataOptions): Metadata {
  const canonical = absoluteUrl(`/${locale}${path}`);
  const ogImage =
    image ?? `/api/og?title=${encodeURIComponent(title)}&locale=${locale}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: {
        ...languageAlternates(path),
        // Search engines pick a locale themselves when none matches.
        "x-default": absoluteUrl(`/ar${path}`),
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article" && publishedTime
        ? {
            publishedTime: new Date(publishedTime).toISOString(),
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
