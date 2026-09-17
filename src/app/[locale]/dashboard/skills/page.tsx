import { LayersIcon, SparklesIcon, StarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getSkillGroups, getSkills } from "@/server/queries/dashboard";
import { getSkillStats } from "@/server/queries/stats";

import { SkillsClient } from "./skills-client";

export default async function SkillsPage(
  props: PageProps<"/[locale]/dashboard/skills">,
) {
  await resolveLocale(props.params);
  const [rows, groups, stats] = await Promise.all([
    getSkills(),
    getSkillGroups(),
    getSkillStats(),
  ]);
  const t = await getTranslations("Skills");
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
          { label: t("stats.total"), value: stats.total, icon: SparklesIcon },
          {
            label: t("stats.groups"),
            value: stats.groups,
            icon: LayersIcon,
            variant: "accent",
          },
          {
            label: t("stats.featured"),
            value: stats.featured,
            icon: StarIcon,
            variant: "success",
          },
        ]}
      />
      <SkillsClient rows={rows} groups={groups} />
    </PageShell>
  );
}
