import { EyeIcon, FileTextIcon, PencilLineIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getPosts, getTags } from "@/server/queries/dashboard";
import { getPostStats } from "@/server/queries/stats";

import { BlogClient } from "./blog-client";

export default async function BlogPage(
  props: PageProps<"/[locale]/dashboard/blog">,
) {
  await resolveLocale(props.params);
  const [rows, tags, stats] = await Promise.all([
    getPosts(),
    getTags(),
    getPostStats(),
  ]);
  const t = await getTranslations("Blog");
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
          { label: t("stats.total"), value: stats.total, icon: FileTextIcon },
          {
            label: t("stats.published"),
            value: stats.published,
            icon: EyeIcon,
            variant: "success",
          },
          {
            label: t("stats.drafts"),
            value: stats.drafts,
            icon: PencilLineIcon,
            variant: "warning",
          },
          {
            label: t("stats.views"),
            value: stats.views.toLocaleString(),
            icon: EyeIcon,
            variant: "accent",
          },
        ]}
      />
      <BlogClient rows={rows} tagSuggestions={tags.map((tag) => tag.name)} />
    </PageShell>
  );
}
