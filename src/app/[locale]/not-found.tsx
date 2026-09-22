import { getTranslations } from "next-intl/server";

import { NotFoundView } from "@/components/shared/not-found-view";

/**
 * Catches `notFound()` from inside a matched route — a project or post slug
 * that does not exist. A URL that matches no route at all never reaches a
 * layout, so `app/global-not-found.tsx` handles that case instead.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main id="main-content" className="flex min-h-svh flex-col">
      <NotFoundView
        title={t("title")}
        description={t("description")}
        actionLabel={t("home")}
        actionHref="/"
      />
    </main>
  );
}
