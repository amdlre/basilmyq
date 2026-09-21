import type { Metadata } from "next";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { Intro } from "@/components/public/sections/intro";
import { SkillsSection } from "@/components/public/sections/skills";
import { TimelineSection } from "@/components/public/sections/timeline";
import { ProjectCard } from "@/components/public/project-card";
import { PersonJsonLd } from "@/components/public/json-ld";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getLocaleDirection } from "@/i18n/routing";
import { toDate } from "@/lib/format";
import { pick } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import { readSocialLinks } from "@/lib/social";
import {
  getAboutSection,
  getHeroCards,
  getHeroSection,
  getPublicPosts,
  getPublicProjects,
  getPublicSkillGroups,
  getSiteSettings,
  getPublicExperiences,
} from "@/server/queries/public";

export async function generateMetadata(
  props: PageProps<"/[locale]">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const settings = await getSiteSettings();
  if (!settings) return {};

  const siteName = pick(settings, "siteName", locale);

  return buildMetadata({
    locale,
    siteName,
    title: `${siteName} — ${pick(settings, "tagline", locale)}`,
    description: pick(settings, "description", locale),
    image: settings.ogImageUrl,
  });
}

/**
 * Column spans for the featured grid, keyed by how many projects are featured.
 * The full set is two halves over three thirds; the smaller sets are arranged
 * so no row is left half empty.
 */
const FEATURED_SPANS: Record<number, string[]> = {
  1: ["md:col-span-6"],
  2: ["md:col-span-3", "md:col-span-3"],
  3: ["md:col-span-2", "md:col-span-2", "md:col-span-2"],
  4: ["md:col-span-3", "md:col-span-3", "md:col-span-3", "md:col-span-3"],
  5: [
    "md:col-span-3",
    "md:col-span-3",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2",
  ],
};

export default async function HomePage(props: PageProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);

  const [
    settings,
    hero,
    about,
    heroCards,
    projects,
    skillGroups,
    experiences,
    posts,
  ] = await Promise.all([
    getSiteSettings(),
    getHeroSection(),
    getAboutSection(),
    getHeroCards(),
    getPublicProjects(),
    getPublicSkillGroups(),
    getPublicExperiences(),
    getPublicPosts(),
  ]);

  const t = await getTranslations("Home");
  const tExp = await getTranslations("Experience");
  const format = await getFormatter();
  const Arrow =
    getLocaleDirection(locale) === "rtl" ? ArrowLeftIcon : ArrowRightIcon;

  // Every section below is gated on both its settings switch and its data, so
  // an empty or disabled section disappears rather than rendering a bare title.
  const featured = projects.filter((project) => project.isFeatured).slice(0, 5);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      {settings ? (
        <PersonJsonLd
          name={pick(settings, "siteName", locale)}
          description={pick(settings, "description", locale)}
          locale={locale}
          email={settings.email}
          image={about?.imageUrl}
          jobTitle={pick(settings, "tagline", locale)}
          sameAs={readSocialLinks(settings.socialLinks).map((link) => link.url)}
        />
      ) : null}

      {/* Hero and "about" are one section: portrait, pitch, stats and cards. */}
      {hero ? (
        <Intro
          hero={hero}
          about={about}
          cards={heroCards}
          cvUrl={settings?.cvUrl ?? null}
          projectsCount={projects.length}
          locale={locale}
        />
      ) : null}

      {settings?.showProjects && featured.length > 0 ? (
        <Section
          title={t("featuredProjects")}
          description={t("featuredProjectsDesc")}
          actions={
            <Button asChild variant="ghost">
              <Link href="/projects">
                {t("allProjects")}
                <Arrow />
              </Link>
            </Button>
          }
        >
          {/*
            Two wide cards over three narrower ones. The spans live here rather
            than in the card so the layout is readable in one place, and the
            shorter sets still fill their rows instead of leaving a gap.
          */}
          <div className="grid gap-4 md:grid-cols-6">
            {featured.map((project, index) => {
              const span =
                FEATURED_SPANS[featured.length]?.[index] ?? "md:col-span-2";

              return (
                <AnimatedIn
                  key={project.id}
                  delay={index * 0.05}
                  className={span}
                >
                  <ProjectCard
                    project={project}
                    locale={locale}
                    size={span === "md:col-span-3" ? "lg" : "md"}
                  />
                </AnimatedIn>
              );
            })}
          </div>
        </Section>
      ) : null}

      {settings?.showSkills ? (
        <SkillsSection
          groups={skillGroups}
          locale={locale}
          title={t("skills")}
          description={t("skillsDesc")}
        />
      ) : null}

      {settings?.showExperience ? (
        <TimelineSection
          experiences={experiences}
          locale={locale}
          title={t("experience")}
          description={t("experienceDesc")}
          presentLabel={tExp("present")}
          currentLabel={tExp("current")}
        />
      ) : null}

      {settings?.showBlog && latestPosts.length > 0 ? (
        <Section
          title={t("latestPosts")}
          description={t("latestPostsDesc")}
          actions={
            <Button asChild variant="ghost">
              <Link href="/blog">
                {t("allPosts")}
                <Arrow />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            {latestPosts.map((post, index) => (
              <AnimatedIn key={post.id} delay={index * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="space-y-2 p-5">
                      <p className="text-xs text-muted-foreground">
                        {toDate(post.publishedAt)
                          ? format.dateTime(toDate(post.publishedAt) as Date, {
                              dateStyle: "medium",
                            })
                          : null}
                      </p>
                      <h3 className="font-heading font-semibold text-balance transition-colors group-hover:text-primary">
                        {pick(post, "title", locale)}
                      </h3>
                      <p className="line-clamp-3 text-sm text-balance text-muted-foreground">
                        {pick(post, "excerpt", locale)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedIn>
            ))}
          </div>
        </Section>
      ) : null}

      <Section>
        <AnimatedIn>
          <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="font-heading text-2xl font-semibold text-balance md:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-balance opacity-90">
              {t("ctaDesc")}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              {/* Bottom of the page: no reason to pull the contact bundle
                  before the reader has scrolled to it. */}
              <Link href="/contact" prefetch={false}>
                {t("ctaButton")}
              </Link>
            </Button>
          </div>
        </AnimatedIn>
      </Section>
    </>
  );
}
