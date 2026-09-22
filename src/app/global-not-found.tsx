import type { Metadata } from "next";
import { cookies } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import { FONT_VARIABLES } from "@/app/fonts";
import { NotFoundView } from "@/components/shared/not-found-view";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { getLocaleDirection, routing, type AppLocale } from "@/i18n/routing";
import { accentStyleSheet, type AccentForeground } from "@/lib/accent";
import { getSiteSettings } from "@/server/queries/public";

/** next-intl's default, used unless the routing config renames it. */
const LOCALE_COOKIE = "NEXT_LOCALE";

import "./globals.css";

/**
 * A URL that matches no route is answered at the routing level, before any
 * layout renders — which is the documented gap when the root layout sits under
 * a top-level dynamic segment, as `[locale]` does here. Without this file Next
 * serves its own black-and-white 404 for `/ar/anything-wrong`.
 *
 * Bypassing the layout means this page sets up the document itself: styles,
 * fonts, direction, theme and the brand accent. The one database read is
 * guarded — a 404 that cannot be served because the database is down would be
 * a worse failure than a 404 in the default blue.
 */

/** No layout ran, so the locale comes from the cookie next-intl already sets. */
async function activeLocale(): Promise<AppLocale> {
  const name =
    typeof routing.localeCookie === "object"
      ? (routing.localeCookie.name ?? LOCALE_COOKIE)
      : LOCALE_COOKIE;
  const value = (await cookies()).get(name)?.value;

  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await activeLocale();
  const t = await getTranslations({ locale, namespace: "NotFound" });
  return { title: t("title") };
}

export default async function GlobalNotFound() {
  const locale = await activeLocale();
  const direction = getLocaleDirection(locale);
  const t = await getTranslations({ locale, namespace: "NotFound" });

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
          <style id="accent-tokens">{accent}</style>
        </head>
      ) : null}
      <body className="flex min-h-full flex-col">
        {/* next-themes writes the class before paint, so the page does not
            flash the light theme at someone reading in the dark one. */}
        <ThemeProvider>
          {/* The locale only — the link back home needs it to build its href,
              and no message on this page is read on the client. */}
          <NextIntlClientProvider locale={locale}>
            <NotFoundView
              title={t("title")}
              description={t("description")}
              actionLabel={t("home")}
              actionHref="/"
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
