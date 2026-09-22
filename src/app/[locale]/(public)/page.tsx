import type { Metadata } from "next";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Intro } from "@/components/public/sections/intro";
import { SkillsSection } from "@/components/public/sections/skills";
import { TimelineSection } from "@/components/public/sections/timeline";
import { PostCard } from "@/components/public/post-card";
import { ProjectCard } from "@/components/public/project-card";
import { PersonJsonLd } from "@/components/public/json-ld";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getLocaleDirection } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { buildMetadata, siteDescription, siteTitle } from "@/lib/seo";
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

  return buildMetadata({
    locale,
    siteName: pick(settings, "siteName", locale),
    title: siteTitle(settings, locale),
    absoluteTitle: true,
    description: siteDescription(settings, locale),
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
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((post, index) => (
              <AnimatedIn key={post.id} delay={index * 0.05}>
                <PostCard post={post} locale={locale} />
              </AnimatedIn>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
