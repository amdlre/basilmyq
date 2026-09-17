import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p className="font-heading text-7xl font-semibold text-muted-foreground/40 tabular-nums">
        404
      </p>
      <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        {t("description")}
      </p>
      <Button asChild className="mt-2">
        <Link href="/">{t("home")}</Link>
      </Button>
    </main>
  );
}
