import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { Section } from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveLocale } from "@/i18n/resolve-locale";
import {
  getPublicProjectCategories,
  getPublicProjects,
} from "@/server/queries/public";

import { ProjectsBrowser } from "./projects-browser";

export default async function ProjectsIndexPage(
  props: PageProps<"/[locale]/projects">,
) {
  const locale = await resolveLocale(props.params);
  const [projects, categories] = await Promise.all([
    getPublicProjects(),
    getPublicProjectCategories(),
  ]);
  const t = await getTranslations("ProjectsPage");

  return (
    <Section title={t("title")} description={t("description")}>
      {/* Same reason as the blog index: nuqs needs a Suspense boundary. */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProjectsBrowser
          projects={projects}
          categories={categories}
          locale={locale}
        />
      </Suspense>
    </Section>
  );
}
