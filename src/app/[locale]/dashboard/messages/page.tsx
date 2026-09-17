import { ArchiveIcon, CalendarIcon, InboxIcon, MailIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getMessages } from "@/server/queries/dashboard";
import { getMessageStats } from "@/server/queries/stats";

import { MessagesClient } from "./messages-client";

export default async function MessagesPage(
  props: PageProps<"/[locale]/dashboard/messages">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([getMessages(), getMessageStats()]);
  const t = await getTranslations("Messages");
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
          { label: t("stats.total"), value: stats.total, icon: InboxIcon },
          {
            label: t("stats.unread"),
            value: stats.unread,
            icon: MailIcon,
            variant: "accent",
          },
          {
            label: t("stats.today"),
            value: stats.today,
            icon: CalendarIcon,
            variant: "success",
          },
          {
            label: t("stats.archived"),
            value: stats.archived,
            icon: ArchiveIcon,
            variant: "warning",
          },
        ]}
      />
      <MessagesClient rows={rows} />
    </PageShell>
  );
}
