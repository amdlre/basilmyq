"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";

type DashboardSidebarProps = {
  unreadMessages: number;
};

export function DashboardSidebar({ unreadMessages }: DashboardSidebarProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;

  // shadcn's `side` is physical, but the in-flow spacer follows the flex
  // direction. Left unset in RTL the spacer reserves the right while the fixed
  // panel paints on the left, and the content renders underneath it.
  const side = getLocaleDirection(locale) === "rtl" ? "right" : "left";

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
                  b
                </div>
                <div className="grid flex-1 text-start leading-tight">
                  <span className="truncate font-semibold">basilmyq</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("dashboard.title")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {DASHBOARD_NAV.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel>
              {t(`dashboard.groups.${group.labelKey}`)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={t(`dashboard.${item.labelKey}`)}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{t(`dashboard.${item.labelKey}`)}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badgeKey === "unreadMessages" &&
                      unreadMessages > 0 ? (
                        <SidebarMenuBadge>{unreadMessages}</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("dashboard.viewSite")}>
              <Link href="/">
                <ExternalLinkIcon />
                <span>{t("dashboard.viewSite")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
