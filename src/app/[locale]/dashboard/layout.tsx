import { CommandPalette } from "@/components/dashboard/command-palette";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { MessagesProvider } from "@/components/shared/messages-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DASHBOARD_NAMESPACES } from "@/i18n/namespaces";
import { resolveLocale } from "@/i18n/resolve-locale";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/server/db";

// Per-request, always: every dashboard page reads the session cookie. Without
// this the empty `generateStaticParams` in the `[locale]` layout would mark
// these routes as ISR-cacheable.
export const dynamic = "force-dynamic";

/**
 * The real guard. The proxy redirects for convenience; this runs in the data
 * layer, so no dashboard route can render without a verified session.
 */
export default async function DashboardLayout(
  props: LayoutProps<"/[locale]/dashboard">,
) {
  await resolveLocale(props.params);
  const session = await requireAuth();

  const unreadMessages = await db.contactMessage.count({
    where: { isRead: false, isArchived: false },
  });

  return (
    <MessagesProvider namespaces={DASHBOARD_NAMESPACES}>
      <SidebarProvider>
        <DashboardSidebar unreadMessages={unreadMessages} />
        <SidebarInset className="min-w-0">
          <DashboardTopbar email={session.email} />
          <main id="main-content" className="min-w-0 flex-1">
            {props.children}
          </main>
        </SidebarInset>
        <CommandPalette />
      </SidebarProvider>
    </MessagesProvider>
  );
}
