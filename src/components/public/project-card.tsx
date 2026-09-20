import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { BLUR_DATA_URL } from "@/lib/blur";
import { cn } from "@/lib/utils";

type ProjectCardRow = Record<string, unknown> & {
  slug: string;
  coverUrl: string | null;
  tags: string[];
  year: number | null;
};

/**
 * One card, used by the home grid and the projects index alike.
 *
 * `size` only scales the typography and tells `next/image` how wide the card
 * will be. How much of the grid a card occupies is the grid's decision, not the
 * card's — the two used to fight over it, with the card setting its own column
 * span from inside.
 */
export function ProjectCard({
  project,
  locale,
  size = "md",
}: {
  project: ProjectCardRow;
  locale: AppLocale;
  size?: "lg" | "md";
}) {
  const title = pick(project, "title", locale);
  const summary = pick(project, "summary", locale);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={title}
            fill
            sizes={
              size === "lg"
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 to-transparent" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-heading font-semibold text-balance",
              size === "lg" ? "text-lg" : "text-base",
            )}
          >
            {title}
          </h3>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <p className="line-clamp-2 text-sm text-balance text-muted-foreground">
          {summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
          {project.year ? (
            <span className="ms-auto text-xs text-muted-foreground tabular-nums">
              {project.year}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
