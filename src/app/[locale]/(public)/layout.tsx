import { Footer } from "@/components/public/footer";
import { MaintenanceScreen } from "@/components/public/maintenance-screen";
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

  // The dashboard stays reachable — only the public site is closed. During an
  // outage there are no settings to show, hence the optional props.
  if (!settings || settings.maintenanceMode) {
    return (
      <MaintenanceScreen
        siteName={settings ? pick(settings, "siteName", locale) : null}
        email={settings?.email}
      />
    );
  }

  return (
    <>
      {/*
        A soft accent wash behind the fold. It sits at the layout level so it
        reaches the very top of the page: the header floats over it rather than
        leaving a band of bare background above the hero.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-primary/10 to-transparent"
      />

      <Navbar
        siteName={pick(settings, "siteName", locale)}
        logoUrl={pickLogo(settings, locale)}
        cvUrl={settings.cvUrl}
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
