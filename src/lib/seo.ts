import type { Metadata } from "next";

import { LOCALES, type AppLocale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { pick, pickOptional } from "@/lib/i18n-content";

/**
 * The site-wide title and description. Settings → SEO wins when it is filled
 * in, the general site copy stands in otherwise.
 *
 * Both the root layout and the home page read these, because a page that
 * builds its own metadata overrides the layout's entirely — which is why
 * filling in the SEO tab used to change every page except the one anyone
 * would check first.
 */
type SiteMeta = Record<string, unknown>;

export function siteTitle(settings: SiteMeta, locale: AppLocale): string {
  return (
    pickOptional(settings, "metaTitle", locale) ??
    `${pick(settings, "siteName", locale)} — ${pick(settings, "tagline", locale)}`
  );
}

export function siteDescription(settings: SiteMeta, locale: AppLocale): string {
  return (
    pickOptional(settings, "metaDescription", locale) ??
    pick(settings, "description", locale)
  );
}

/** Used when nothing is uploaded in Settings → SEO. Served from `public/`. */
export const DEFAULT_FAVICON = "/favicon.ico";

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
  /**
   * Skips the root layout's `"%s — site"` template. Only the home page needs
   * it: its title already is the site title, so the template would repeat it.
   */
  absoluteTitle?: boolean;
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
  absoluteTitle = false,
}: BuildMetadataOptions): Metadata {
  const canonical = absoluteUrl(`/${locale}${path}`);
  const ogImage =
    image ?? `/api/og?title=${encodeURIComponent(title)}&locale=${locale}`;

  return {
    // A plain string picks up the layout's template, so every page reads
    // "<page> — <site>" without spelling the site out. The social titles below
    // stay bare on purpose: OG carries `siteName` in its own field.
    title: absoluteTitle ? { absolute: title } : title,
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
