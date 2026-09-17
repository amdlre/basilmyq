import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { resolveLocale } from "@/i18n/resolve-locale";
import type {
  AboutSectionInput,
  HeroSectionInput,
  SiteSettingInput,
} from "@/lib/validations/content";
import { getSingletons } from "@/server/queries/dashboard";

import { SettingsClient } from "./settings-client";

type SocialLink = { label: string; url: string; icon: string };

/** `socialLinks` is a Json column, so it is narrowed before it reaches the form. */
function readSocialLinks(value: unknown): SocialLink[] {
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

export default async function SettingsPage(
  props: PageProps<"/[locale]/dashboard/settings">,
) {
  await resolveLocale(props.params);
  const { settings, hero, about } = await getSingletons();
  const t = await getTranslations("Settings");
  const tNav = await getTranslations("Nav");

  const shell = (children: React.ReactNode) => (
    <PageShell
      title={t("title")}
      description={t("description")}
      breadcrumbs={[
        { label: tNav("dashboard.title"), href: "/dashboard" },
        { label: t("title") },
      ]}
    >
      {children}
    </PageShell>
  );

  if (!settings || !hero || !about) {
    // Only possible on an unseeded database.
    return shell(
      <EmptyState title={t("title")} description={t("description")} />,
    );
  }

  const {
    id: _id,
    createdAt,
    updatedAt,
    cvDownloadCount,
    socialLinks,
    ...rest
  } = settings;
  void _id;
  void createdAt;
  void updatedAt;

  const settingsValues: SiteSettingInput = {
    ...rest,
    socialLinks: readSocialLinks(socialLinks),
  };

  const {
    id: _heroId,
    createdAt: _heroCreated,
    updatedAt: _heroUpdated,
    ...heroRest
  } = hero;
  const heroValues: HeroSectionInput = heroRest;

  const {
    id: _aboutId,
    createdAt: _aboutCreated,
    updatedAt: _aboutUpdated,
    ...aboutRest
  } = about;
  const aboutValues: AboutSectionInput = aboutRest;

  return shell(
    <SettingsClient
      settings={settingsValues}
      hero={heroValues}
      about={aboutValues}
      cvDownloadCount={cvDownloadCount}
    />,
  );
}
