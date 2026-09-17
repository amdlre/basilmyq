import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/i18n/resolve-locale";

export default async function HomePage(props: PageProps<"/[locale]">) {
  await resolveLocale(props.params);
  const t = await getTranslations("Home");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-24">
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="gap-3">
          <Badge variant="secondary" className="w-fit">
            {t("eyebrow")}
          </Badge>
          <CardTitle className="text-3xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-balance text-muted-foreground">
          <p>{t("description")}</p>
          <p className="font-medium text-foreground">{t("phase")}</p>
        </CardContent>
      </Card>
    </section>
  );
}
