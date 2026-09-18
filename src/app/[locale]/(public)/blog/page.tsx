import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Section } from "@/components/shared/section";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildMetadata } from "@/lib/seo";
import { getPublicPosts } from "@/server/queries/public";

import { BlogBrowser } from "./blog-browser";

export async function generateMetadata(
  props: PageProps<"/[locale]/blog">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const t = await getTranslations({ locale, namespace: "BlogPage" });

  return buildMetadata({
    locale,
    path: "/blog",
    title: t("title"),
    description: t("description"),
  });
}

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
