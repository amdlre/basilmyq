import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AppProviders } from "@/components/shared/app-providers";
import { FONT_VARIABLES } from "@/app/fonts";
import { resolveLocale } from "@/i18n/resolve-locale";
import { PUBLIC_NAMESPACES } from "@/i18n/namespaces";
import { getLocaleDirection } from "@/i18n/routing";
import { accentStyleSheet, type AccentForeground } from "@/lib/accent";
import { DEFAULT_FAVICON, siteDescription, siteTitle } from "@/lib/seo";
import { getSiteSettings } from "@/server/queries/public";

import "../globals.css";

/**
 * Empty on purpose: every public page is rendered on its first request and
 * cached from then on (ISR), rather than at build time. The Docker build has no
 * database, and building against production would bake stale content into
 * the image anyway. Dashboard writes still refresh pages through `updateTag`.
 */
export function generateStaticParams(): { locale: string }[] {
  return [];
}

/**
 * The tab title, the search snippet and the tab icon all come from
 * Settings → SEO. Each falls back to the general site copy when left empty, so
 * the SEO tab only has to be filled in when it should differ. A database that
 * cannot be reached returns nothing rather than a hardcoded string — the
 * maintenance screen is what the visitor sees in that case anyway.
 */
export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const settings = await getSiteSettings().catch(() => null);
  if (!settings) return {};

  const site = siteTitle(settings, locale);

  return {
    // `default` is what a page without its own title gets; `template` is what
    // every page with one gets appended to it.
    title: { default: site, template: `%s — ${site}` },
    description: siteDescription(settings, locale),
    // Explicit, because Next's `app/favicon.ico` file convention outranks
    // anything set here — so that file lives in `public/` instead and is named
    // as the fallback rather than silently winning.
    icons: { icon: settings.faviconUrl ?? DEFAULT_FAVICON },
  };
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);
  const direction = getLocaleDirection(locale);
  const t = await getTranslations({ locale, namespace: "Common" });

  // The accent chosen in Settings overrides the design-system default. Read
  // here rather than in the public layout so the dashboard is themed too, and
  // guarded so an unreachable database falls back to the built-in accent
  // instead of failing the whole document.
  const settings = await getSiteSettings().catch(() => null);
  const accent = accentStyleSheet(
    settings?.accentColor,
    settings?.accentForeground as AccentForeground | undefined,
  );

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${FONT_VARIABLES} h-full antialiased`}
    >
      {accent ? (
        <head>
          {/*
            Injected rather than written into globals.css because the value
            lives in the database. It is generated from parsed numbers, never
            interpolated from the raw input, so nothing the field accepts can
          */}
          <style id="accent-tokens">{accent}</style>
        </head>
      ) : null}
      <body className="flex min-h-full flex-col">
        {/* Visual styles are gated behind focus: `sr-only` zeroes padding, and
            re-adding it unfocused gives the link width that shifts the page in RTL. */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t("skipToContent")}
        </a>
        <AppProviders direction={direction} namespaces={PUBLIC_NAMESPACES}>
          {props.children}
        </AppProviders>
      </body>
    </html>
  );
}
