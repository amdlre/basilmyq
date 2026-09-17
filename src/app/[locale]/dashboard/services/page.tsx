import { EyeIcon, EyeOffIcon, WrenchIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getServices } from "@/server/queries/dashboard";
import { getServiceStats } from "@/server/queries/stats";

import { ServicesClient } from "./services-client";

export default async function ServicesPage(
  props: PageProps<"/[locale]/dashboard/services">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([getServices(), getServiceStats()]);
  const t = await getTranslations("Services");
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
          { label: t("stats.total"), value: stats.total, icon: WrenchIcon },
          {
            label: t("stats.visible"),
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
        ]}
      />
      <ServicesClient rows={rows} />
    </PageShell>
  );
}
