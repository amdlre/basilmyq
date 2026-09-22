"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { BrandMark } from "@/components/shared/brand-mark";
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
  /** Settings → General, for the active language. Null before that row exists. */
  siteName: string | null;
  logoUrl: string | null;
};

export function DashboardSidebar({
  unreadMessages,
  siteName,
  logoUrl,
}: DashboardSidebarProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;

  // shadcn's `side` is physical, but the in-flow spacer follows the flex
  // direction. Left unset in RTL the spacer reserves the right while the fixed
  // panel paints on the left, and the content renders underneath it.
  const side = getLocaleDirection(locale) === "rtl" ? "right" : "left";

  const brandName = siteName ?? t("dashboard.title");

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={brandName}>
              <Link href="/dashboard">
                {/* Collapsed, the button is a bare 32px square: room for
                    the logo alone, so the full mark steps aside. */}
                <BrandMark
                  name={brandName}
                  logoUrl={logoUrl}
                  variant="mark"
                  className="hidden group-data-[collapsible=icon]:inline-flex"
                />
                <span className="grid min-w-0 flex-1 text-start leading-tight group-data-[collapsible=icon]:hidden">
                  <BrandMark
                    name={brandName}
                    logoUrl={logoUrl}
                    className="min-w-0 [&>span]:truncate"
                  />
                  {siteName ? (
                    <span className="truncate text-xs font-bold text-sidebar-foreground/85">
                      {t("dashboard.title")}
                    </span>
                  ) : null}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {DASHBOARD_NAV.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel className="text-sidebar-foreground/85">
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
                          <span className="font-bold">
                            {t(`dashboard.${item.labelKey}`)}
                          </span>
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
