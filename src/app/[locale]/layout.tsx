import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { AppProviders } from "@/components/shared/app-providers";
import { resolveLocale } from "@/i18n/resolve-locale";
import { PUBLIC_NAMESPACES } from "@/i18n/namespaces";
import { getLocaleDirection, routing } from "@/i18n/routing";

import "../globals.css";

const fontLatin = Geist({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  // Only the dashboard's markdown editor uses it, so it is fetched on demand
  // rather than preloaded on every page.
  preload: false,
});

const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  // Two weights, not five: each extra weight is another ~35 KB preloaded on
  // every page, and the design only ever uses body and semibold.
  weight: ["400", "600"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);
  const direction = getLocaleDirection(locale);
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${fontLatin.variable} ${fontMono.variable} ${fontArabic.variable} h-full antialiased`}
    >
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
