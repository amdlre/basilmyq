import {
  EyeIcon,
  FileTextIcon,
  FolderKanbanIcon,
  MailIcon,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getOverviewStats } from "@/server/queries/stats";

const ACTION_KEYS = [
  "create",
  "update",
  "delete",
  "flag",
  "reorder",
  "duplicate",
] as const;

const ENTITY_KEYS = [
  "project",
  "post",
  "service",
  "testimonial",
  "experience",
  "education",
  "skill",
  "skillGroup",
  "projectCategory",
] as const;

type ActionKey = (typeof ACTION_KEYS)[number];
type EntityKey = (typeof ENTITY_KEYS)[number];

const isActionKey = (value: string): value is ActionKey =>
  (ACTION_KEYS as readonly string[]).includes(value);
const isEntityKey = (value: string): value is EntityKey =>
  (ENTITY_KEYS as readonly string[]).includes(value);

export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">,
) {
  await resolveLocale(props.params);
  const stats = await getOverviewStats();
  const t = await getTranslations("Overview");
  const format = await getFormatter();

  return (
    <PageShell title={t("title")} description={t("description")}>
      <StatsGrid
        stats={[
          {
            label: t("stats.projects"),
            value: stats.projects,
            icon: FolderKanbanIcon,
          },
          {
            label: t("stats.posts"),
            value: stats.posts,
            icon: FileTextIcon,
            variant: "success",
          },
          {
            label: t("stats.unread"),
            value: stats.unread,
            icon: MailIcon,
            variant: "accent",
          },
          {
            label: t("stats.views"),
            value: stats.views.toLocaleString(),
            icon: EyeIcon,
            variant: "warning",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t("recentMessages")}</CardTitle>
            <Link
              href="/dashboard/messages"
              className="text-sm text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noMessages")}</p>
            ) : (
              <ul className="divide-y">
                {stats.recentMessages.map((message) => (
                  <li
                    key={message.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {message.subject}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {message.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format.relativeTime(message.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.activity.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusBadge
                        label={
                          isActionKey(entry.action)
                            ? t(`actions.${entry.action}`)
                            : entry.action
                        }
                        tone={entry.action === "delete" ? "danger" : "neutral"}
                      />
                      <span className="truncate text-sm text-muted-foreground">
                        {isEntityKey(entry.entity)
                          ? t(`entities.${entry.entity}`)
                          : entry.entity}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format.relativeTime(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
