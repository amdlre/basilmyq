"use client";

import { useMemo } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

import { PostCard } from "@/components/public/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AppLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";

type Post = Record<string, unknown> & {
  id: string;
  slug: string;
  coverUrl: string | null;
  tags: string[];
  readTimeMinutes: number;
  views: number;
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
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
