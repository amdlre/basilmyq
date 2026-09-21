"use client";

import Image from "next/image";
import {
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  ClockIcon,
  EyeIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/blur";
import { toDate } from "@/lib/format";
import { pick } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

type PostCardRow = Record<string, unknown> & {
  slug: string;
  coverUrl: string | null;
  tags: string[];
  readTimeMinutes: number;
  views: number;
  publishedAt: Date | string | null;
};

/**
 * One post card, used by the blog index and the home page alike.
 *
 * The cover fills the card and the text sits on top of it, which means the text
 * has to survive whatever the image happens to be. Two things make that safe: a
 * dark scrim that deepens towards the bottom, and a blurred panel behind the
 * text itself. Because the treatment is always dark, the card reads the same in
 * both themes rather than needing a light and a dark variant.
 *
 * Secondary details are revealed on hover — and on keyboard focus, so they are
 * not lost to anyone who never hovers.
 *
 * A client component because the blog index filters in the browser and cannot
 * host an async server one.
 */
export function PostCard({
  post,
  locale,
  size = "md",
}: {
  post: PostCardRow;
  locale: AppLocale;
  size?: "lg" | "md";
}) {
  const t = useTranslations("BlogPage");
  const format = useFormatter();

  const title = pick(post, "title", locale);
  const published = toDate(post.publishedAt);
  const tag = post.tags[0];
  const Arrow =
    getLocaleDirection(locale) === "rtl" ? ArrowUpLeftIcon : ArrowUpRightIcon;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        size === "lg" ? "aspect-[4/3] md:aspect-[3/4]" : "aspect-[16/10]",
      )}
    >
      {post.coverUrl ? (
        <Image
          src={post.coverUrl}
          alt=""
          fill
          sizes={
            size === "lg"
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/10 to-muted" />
      )}

      {/* Deepens towards the bottom so the panel below never sits on a bright edge. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5"
      />

      <div className="relative mt-auto w-full p-3">
        <div className="rounded-xl bg-black/30 p-4 backdrop-blur-md">
          {tag ? (
            <span className="mb-3 inline-flex rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              {tag}
            </span>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "font-heading font-semibold text-balance text-white",
                size === "lg" ? "text-xl md:text-2xl" : "text-base md:text-lg",
              )}
            >
              {title}
            </h3>
            <Arrow className="mt-0.5 size-4 shrink-0 text-white/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-white" />
          </div>

          {/*
            Collapsed to zero height until hover or focus. The grid-rows trick
            animates to the content's natural height, which a max-height guess
            cannot do without clipping longer text.
          */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-white/75">
                {published ? (
                  <>
                    <time dateTime={published.toISOString()}>
                      {format.relativeTime(published)}
                    </time>
                    <span aria-hidden>·</span>
                    <span>
                      {format.dateTime(published, { dateStyle: "medium" })}
                    </span>
                    <span aria-hidden>·</span>
                  </>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {t("readTime", { minutes: post.readTimeMinutes })}
                </span>
                {post.views > 0 ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <EyeIcon className="size-3" />
                      {t("views", { count: post.views })}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
