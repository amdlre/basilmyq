import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EyeIcon } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { BlogPostingJsonLd } from "@/components/public/json-ld";
import { Markdown } from "@/components/public/markdown";
import { ReadingProgress } from "@/components/public/reading-progress";
import { ShareButton } from "@/components/public/share-button";
import { TableOfContents } from "@/components/public/table-of-contents";
import { ViewCounter } from "@/components/public/view-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { toDate } from "@/lib/format";
import { BLUR_DATA_URL } from "@/lib/blur";
import { pick } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import {
  getPublicPostBySlug,
  getPublicPosts,
  getSiteSettings,
} from "@/server/queries/public";

const CONTENT_ID = "post-content";

export async function generateMetadata(
  props: PageProps<"/[locale]/blog/[slug]">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const { slug } = await props.params;
  const post = await getPublicPostBySlug(slug);

  // Drafts and hidden posts must not get indexable metadata.
  if (!post) return { robots: { index: false, follow: false } };

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: pick(post, "title", locale),
    description: pick(post, "excerpt", locale),
    image: post.coverUrl,
    type: "article",
    publishedTime: post.publishedAt,
    tags: post.tags,
  });
}

/** Pre-renders every published post at build time. */
export async function generateStaticParams() {
  const posts = await getPublicPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage(
  props: PageProps<"/[locale]/blog/[slug]">,
) {
  const locale = await resolveLocale(props.params);
  const { slug } = await props.params;

  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("BlogPage");
  const format = await getFormatter();
  const title = pick(post, "title", locale);
  const published = toDate(post.publishedAt);

  const settings = await getSiteSettings();

  return (
    <>
      <BlogPostingJsonLd
        headline={title}
        description={pick(post, "excerpt", locale)}
        locale={locale}
        slug={post.slug}
        image={post.coverUrl}
        datePublished={published?.toISOString()}
        dateModified={new Date(post.updatedAt).toISOString()}
        keywords={post.tags}
        authorName={settings ? pick(settings, "siteName", locale) : "basilmyq"}
      />
      <ReadingProgress />
      <ViewCounter slug={slug} />

      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-6">
          <Link href="/blog">{t("back")}</Link>
        </Button>

        <div className="lg:grid lg:grid-cols-[1fr_14rem] lg:gap-12">
          <article className="max-w-prose min-w-0">
            <header className="space-y-4">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {published ? (
                  <time dateTime={published.toISOString()}>
                    {format.dateTime(published, { dateStyle: "long" })}
                  </time>
                ) : null}
                <span aria-hidden>·</span>
                <span>{t("readTime", { minutes: post.readTimeMinutes })}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="size-3.5" />
                  {t("views", { count: post.views })}
                </span>
              </div>

              <p className="text-lg text-balance text-muted-foreground">
                {pick(post, "excerpt", locale)}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
                <ShareButton title={title} />
              </div>
            </header>

            {post.coverUrl ? (
              <Image
                src={post.coverUrl}
                alt={title}
                width={1200}
                height={675}
                priority
                className="mt-8 aspect-video w-full rounded-xl object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            ) : null}

            <div id={CONTENT_ID} className="mt-10">
              <Markdown content={pick(post, "content", locale)} />
            </div>
          </article>

          <aside className="mt-12 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <TableOfContents contentId={CONTENT_ID} />
          </aside>
        </div>
      </div>
    </>
  );
}
