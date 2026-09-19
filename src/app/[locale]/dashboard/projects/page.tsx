import { EyeIcon, EyeOffIcon, FolderKanbanIcon, StarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import {
  getProjectCategories,
  getProjects,
  getTags,
} from "@/server/queries/dashboard";
import { getProjectStats } from "@/server/queries/stats";

import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage(
  props: PageProps<"/[locale]/dashboard/projects">,
) {
  await resolveLocale(props.params);

  const [rows, categories, tags, stats] = await Promise.all([
    getProjects(),
    getProjectCategories(),
    getTags(),
    getProjectStats(),
  ]);

  const t = await getTranslations("Projects");
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
            label: t("stats.total"),
            value: stats.total,
            icon: FolderKanbanIcon,
          },
          {
            label: t("stats.published"),
            value: stats.visible,
            icon: EyeIcon,
            variant: "success",
          },
          {
            label: t("stats.hidden"),
            value: stats.hidden,
            icon: EyeOffIcon,
            variant: "warning",
          },
          {
            label: t("stats.featured"),
            value: stats.featured,
            icon: StarIcon,
            variant: "accent",
          },
        ]}
      />
      <ProjectsClient
        rows={rows}
        categories={categories}
        tagSuggestions={tags.map((tag) => tag.name)}
      />
    </PageShell>
  );
}
