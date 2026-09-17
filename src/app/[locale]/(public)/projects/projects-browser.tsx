"use client";

import { useMemo } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/public/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

type Project = Record<string, unknown> & {
  id: string;
  slug: string;
  coverUrl: string | null;
  tags: string[];
  year: number | null;
  categoryId: string | null;
};

type Category = Record<string, unknown> & { id: string; slug: string };

/** Category, tag and search all live in the URL, so a filtered view is shareable. */
export function ProjectsBrowser({
  projects,
  categories,
  locale,
}: {
  projects: Project[];
  categories: Category[];
  locale: AppLocale;
}) {
  const t = useTranslations("ProjectsPage");
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      tag: parseAsString.withDefault(""),
    },
    { history: "replace", clearOnDefault: true },
  );

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))].sort(),
    [projects],
  );

  const visible = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();

    return projects.filter((project) => {
      if (filters.category && project.categoryId !== filters.category) {
        return false;
      }
      if (filters.tag && !project.tags.includes(filters.tag)) return false;
      if (!needle) return true;

      return [
        pick(project, "title", locale),
        pick(project, "summary", locale),
        project.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filters, locale, projects]);

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

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.category ? "outline" : "default"}
            size="sm"
            onClick={() => void setFilters({ category: null })}
          >
            {t("allCategories")}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={filters.category === category.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                void setFilters({
                  category:
                    filters.category === category.id ? null : category.id,
                })
              }
            >
              {pick(category, "name", locale)}
            </Button>
          ))}
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
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  filters.tag === tag
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {tag}
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
        <>
          <p className="text-sm text-muted-foreground">
            {t("count", { count: visible.length })}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
