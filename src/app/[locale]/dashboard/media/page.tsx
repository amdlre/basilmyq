import { FileIcon, HardDriveIcon, ImageIcon, LayersIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { formatBytes } from "@/lib/format";
import { getMedia } from "@/server/queries/dashboard";
import { getMediaStats } from "@/server/queries/stats";

import { MediaClient } from "./media-client";

export default async function MediaPage(
  props: PageProps<"/[locale]/dashboard/media">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([getMedia(), getMediaStats()]);
  const t = await getTranslations("Media");
  const tNav = await getTranslations("Nav");
  const locale = await getLocale();

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
          { label: t("stats.total"), value: stats.total, icon: LayersIcon },
          {
            label: t("stats.size"),
            value: formatBytes(stats.bytes, locale),
            icon: HardDriveIcon,
            variant: "accent",
          },
          {
            label: t("stats.images"),
            value: stats.images,
            icon: ImageIcon,
            variant: "success",
          },
          {
            label: t("stats.files"),
            value: stats.files,
            icon: FileIcon,
            variant: "warning",
          },
        ]}
      />
      <MediaClient rows={rows} />
    </PageShell>
  );
}
