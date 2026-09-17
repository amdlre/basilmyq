import { BriefcaseIcon, CalendarIcon, ZapIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getExperiences } from "@/server/queries/dashboard";
import { getExperienceStats } from "@/server/queries/stats";

import { ExperienceClient } from "./experience-client";

export default async function ExperiencePage(
  props: PageProps<"/[locale]/dashboard/experience">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([
    getExperiences(),
    getExperienceStats(),
  ]);
  const t = await getTranslations("Experience");
  const tNav = await getTranslations("Nav");

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      breadcrumbs={[
        { label: tNav("dashboard.title"), href: "/dashboard" },
        { label: t("title") },
      ]}
    >
      <StatsGrid
        stats={[
          { label: t("stats.total"), value: stats.total, icon: BriefcaseIcon },
          {
            label: t("stats.years"),
            value: stats.years,
            icon: CalendarIcon,
            variant: "accent",
          },
          {
            label: t("stats.current"),
            value: stats.current,
            icon: ZapIcon,
            variant: "success",
          },
        ]}
      />
      <ExperienceClient rows={rows} />
    </PageShell>
  );
}
