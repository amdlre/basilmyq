import { AwardIcon, GraduationCapIcon, LayersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getEducation } from "@/server/queries/dashboard";
import { getEducationStats } from "@/server/queries/stats";

import { EducationClient } from "./education-client";

export default async function EducationPage(
  props: PageProps<"/[locale]/dashboard/education">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([
    getEducation(),
    getEducationStats(),
  ]);
  const t = await getTranslations("Education");
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
          {
            label: t("stats.degrees"),
            value: stats.degrees,
            icon: GraduationCapIcon,
            variant: "accent",
          },
          {
            label: t("stats.certificates"),
            value: stats.certificates,
            icon: AwardIcon,
            variant: "success",
          },
          { label: t("stats.total"), value: stats.total, icon: LayersIcon },
        ]}
      />
      <EducationClient rows={rows} />
    </PageShell>
  );
}
