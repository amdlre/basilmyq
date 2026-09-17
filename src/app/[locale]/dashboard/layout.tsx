import { requireAuth } from "@/lib/auth/require-auth";
import { resolveLocale } from "@/i18n/resolve-locale";

/**
 * The real guard. The proxy redirects for convenience; this runs in the data
 * layer, so no dashboard route can render without a verified session.
 * Sidebar and Topbar arrive in Phase 3.
 */
export default async function DashboardLayout(
  props: LayoutProps<"/[locale]/dashboard">,
) {
  await resolveLocale(props.params);
  await requireAuth();

  return (
    <main id="main-content" className="flex-1">
      {props.children}
    </main>
  );
}
