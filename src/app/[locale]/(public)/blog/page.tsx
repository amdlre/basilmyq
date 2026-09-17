import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { Section } from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getPublicPosts } from "@/server/queries/public";

import { BlogBrowser } from "./blog-browser";

export default async function BlogIndexPage(
  props: PageProps<"/[locale]/blog">,
) {
  const locale = await resolveLocale(props.params);
  const posts = await getPublicPosts();
  const t = await getTranslations("BlogPage");

  return (
    <Section title={t("title")} description={t("description")}>
      {/*
        The browser reads its filters from the query string via nuqs, which
        calls useSearchParams. Prerendering a static shell requires that to sit
        behind a Suspense boundary.
      */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <BlogBrowser posts={posts} locale={locale} />
      </Suspense>
    </Section>
  );
}
