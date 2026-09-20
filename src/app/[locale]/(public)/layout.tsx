import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { resolveLocale } from "@/i18n/resolve-locale";
import { pick, pickLogo } from "@/lib/i18n-content";
import { readSocialLinks } from "@/lib/social";
import { getSiteSettings } from "@/server/queries/public";

/**
 * Rendered per request rather than cached as a static page. Its data reads are
 * still cached, so this costs little — and it means a database outage renders
 * the maintenance screen (see `error.tsx`) instead of an uncatchable 500, and
 * never caches that outage as if it were the site.
 */
export const dynamic = "force-dynamic";

export default async function PublicLayout(props: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);
  // A database that is down or not yet seeded closes the site rather than
  // failing the request: visitors see the maintenance screen instead of the
  // host's "Bad Gateway".
  const settings = await getSiteSettings().catch(() => null);
  const t = await getTranslations("Maintenance");

  // The dashboard stays reachable — only the public site is closed.
  if (!settings || settings.maintenanceMode) {
    return (
      <main
        id="main-content"
        className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center"
      >
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="max-w-sm text-balance text-muted-foreground">
          {t("description")}
        </p>
      </main>
    );
  }

  const cvUrl = locale === "ar" ? settings.cvUrlAr : settings.cvUrlEn;

  return (
    <>
      <Navbar
        siteName={pick(settings, "siteName", locale)}
        logoUrl={pickLogo(settings, locale)}
        cvUrl={cvUrl ?? settings.cvUrlEn ?? settings.cvUrlAr}
      />
      <main id="main-content" className="flex-1">
        {props.children}
      </main>
      <Footer
        settings={settings}
        socialLinks={readSocialLinks(settings.socialLinks)}
        locale={locale}
      />
    </>
  );
}
