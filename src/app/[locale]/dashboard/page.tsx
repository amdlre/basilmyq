import { getTranslations } from "next-intl/server";

import { LogoutButton } from "@/components/dashboard/logout-button";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/i18n/resolve-locale";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">,
) {
  await resolveLocale(props.params);
  const session = await requireAuth();
  const t = await getTranslations("Dashboard");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>{t("title")}</CardTitle>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LocaleToggle />
            <LogoutButton />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("signedInAs")} <span dir="ltr">{session.email}</span>
        </CardContent>
      </Card>
    </section>
  );
}
