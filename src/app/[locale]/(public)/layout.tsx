import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { resolveLocale } from "@/i18n/resolve-locale";
import { pick, pickLogo } from "@/lib/i18n-content";
import { readSocialLinks } from "@/lib/social";
import { getSiteSettings } from "@/server/queries/public";

export default async function PublicLayout(props: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);
  const settings = await getSiteSettings();
  const t = await getTranslations("Maintenance");

  if (!settings) notFound();

  if (settings.maintenanceMode) {
    // The dashboard stays reachable — only the public site is closed.
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
