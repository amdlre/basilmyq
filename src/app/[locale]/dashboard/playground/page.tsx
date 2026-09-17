import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { resolveLocale } from "@/i18n/resolve-locale";
import { requireAuth } from "@/lib/auth/require-auth";

import { PlaygroundClient } from "./playground-client";

export default async function PlaygroundPage(
  props: PageProps<"/[locale]/dashboard/playground">,
) {
  await resolveLocale(props.params);
  await requireAuth();
  const t = await getTranslations("Playground");
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
      <PlaygroundClient />
    </PageShell>
  );
}
