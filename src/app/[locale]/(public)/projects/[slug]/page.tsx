import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { GithubIcon } from "@/components/public/brand-icons";
import { Gallery } from "@/components/public/gallery";
import { Markdown } from "@/components/public/markdown";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getLocaleDirection } from "@/i18n/routing";
import { pick, pickOptional } from "@/lib/i18n-content";
import {
  getPublicProjectBySlug,
  getPublicProjects,
} from "@/server/queries/public";

type ResultEntry = { labelAr: string; labelEn: string; value: string };

/** `results` is a Json column; narrowed once here. */
function readResults(value: unknown): ResultEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (
      typeof record.labelAr !== "string" ||
      typeof record.labelEn !== "string" ||
      typeof record.value !== "string"
    ) {
      return [];
    }
    return [
      {
        labelAr: record.labelAr,
        labelEn: record.labelEn,
        value: record.value,
      },
    ];
  });
}

export default async function ProjectDetailPage(
  props: PageProps<"/[locale]/projects/[slug]">,
) {
  const locale = await resolveLocale(props.params);
  const { slug } = await props.params;

  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations("ProjectsPage");
  const Arrow =
    getLocaleDirection(locale) === "rtl" ? ArrowLeftIcon : ArrowRightIcon;

  const title = pick(project, "title", locale);
  const results = readResults(project.results);

  // "Next project" follows the same order the index uses, and wraps around.
  const all = await getPublicProjects();
  const index = all.findIndex((entry) => entry.id === project.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  const meta = [
    { label: t("client"), value: pickOptional(project, "client", locale) },
    { label: t("year"), value: project.year ? String(project.year) : null },
    { label: t("role"), value: pickOptional(project, "role", locale) },
  ].filter((entry) => entry.value);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-14">
      <Button asChild variant="ghost" size="sm" className="-ms-2 mb-6">
        <Link href="/projects">{t("back")}</Link>
      </Button>

      <AnimatedIn className="space-y-5">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {title}
        </h1>
        <p className="text-lg text-balance text-muted-foreground">
          {pick(project, "summary", locale)}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.liveUrl ? (
            <Button asChild size="sm">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon />
                {t("live")}
              </a>
            </Button>
          ) : null}
          {project.repoUrl ? (
            <Button asChild size="sm" variant="outline">
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="size-4" />
                {t("repo")}
              </a>
            </Button>
          ) : null}
        </div>
      </AnimatedIn>

      {project.coverUrl ? (
        <AnimatedIn delay={0.05} className="mt-10">
          <Image
            src={project.coverUrl}
            alt={title}
            width={1600}
            height={900}
            priority
            className="aspect-video w-full rounded-xl object-cover"
          />
        </AnimatedIn>
      ) : null}

      {meta.length > 0 ? (
        <dl className="mt-10 grid grid-cols-2 gap-6 border-y py-6 sm:grid-cols-4">
          {meta.map((entry) => (
            <div key={entry.label}>
              <dt className="text-xs text-muted-foreground">{entry.label}</dt>
              <dd className="mt-1 font-medium">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <AnimatedIn className="mt-10">
        <Markdown content={pick(project, "content", locale)} />
      </AnimatedIn>

      {results.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            {t("results")}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((result) => (
              <div key={result.labelEn} className="rounded-lg bg-muted/50 p-5">
                <dt className="font-heading text-2xl font-semibold text-primary tabular-nums">
                  {result.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar" ? result.labelAr : result.labelEn}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {project.gallery.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            {t("gallery")}
          </h2>
          <Gallery images={project.gallery} alt={title} />
        </section>
      ) : null}

      {next ? (
        <nav className="mt-16 border-t pt-8">
          <Link
            href={`/projects/${next.slug}`}
            className="group flex items-center justify-between gap-4 rounded-lg p-4 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div>
              <p className="text-xs text-muted-foreground">
                {t("nextProject")}
              </p>
              <p className="mt-1 font-heading font-semibold transition-colors group-hover:text-primary">
                {pick(next, "title", locale)}
              </p>
            </div>
            <Arrow className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
