"use client";

import { useMemo } from "react";
import { SearchIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { toDate } from "@/lib/format";
import { pick } from "@/lib/i18n-content";

type Post = Record<string, unknown> & {
  id: string;
  slug: string;
  tags: string[];
  readTimeMinutes: number;
  publishedAt: Date | string | null;
};

export function BlogBrowser({
  posts,
  locale,
}: {
  posts: Post[];
  locale: AppLocale;
}) {
  const t = useTranslations("BlogPage");
  const format = useFormatter();
  const [filters, setFilters] = useQueryStates(
    { q: parseAsString.withDefault(""), tag: parseAsString.withDefault("") },
    { history: "replace", clearOnDefault: true },
  );

  const allTags = useMemo(
    () => [...new Set(posts.flatMap((post) => post.tags))].sort(),
    [posts],
  );

  const visible = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();

    return posts.filter((post) => {
      if (filters.tag && !post.tags.includes(filters.tag)) return false;
      if (!needle) return true;
      return [pick(post, "title", locale), pick(post, "excerpt", locale)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filters, locale, posts]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(event) =>
              void setFilters({ q: event.target.value || null })
            }
            placeholder={t("search")}
            aria-label={t("search")}
            className="ps-9"
          />
        </div>

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  void setFilters({ tag: filters.tag === tag ? null : tag })
                }
              >
                <Badge
                  variant={filters.tag === tag ? "default" : "outline"}
                  className="font-normal"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t("empty")}
          description={t("emptyHint")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((post) => {
            const published = toDate(post.publishedAt);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="space-y-2 p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {published ? (
                        <span>
                          {format.dateTime(published, { dateStyle: "medium" })}
                        </span>
                      ) : null}
                      <span aria-hidden>·</span>
                      <span>
                        {t("readTime", { minutes: post.readTimeMinutes })}
                      </span>
                    </div>
                    <h2 className="font-heading text-lg font-semibold text-balance transition-colors group-hover:text-primary">
                      {pick(post, "title", locale)}
                    </h2>
                    <p className="line-clamp-3 text-sm text-balance text-muted-foreground">
                      {pick(post, "excerpt", locale)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
