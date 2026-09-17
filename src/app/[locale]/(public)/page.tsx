import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { Hero } from "@/components/public/sections/hero";
import { ServicesSection } from "@/components/public/sections/services";
import { SkillsSection } from "@/components/public/sections/skills";
import { TestimonialsSection } from "@/components/public/sections/testimonials";
import { TimelineSection } from "@/components/public/sections/timeline";
import { ProjectCard } from "@/components/public/project-card";
import { Markdown } from "@/components/public/markdown";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getLocaleDirection } from "@/i18n/routing";
import { toDate } from "@/lib/format";
import { pick } from "@/lib/i18n-content";
import {
  getAboutSection,
  getHeroSection,
  getPublicPosts,
  getPublicProjects,
  getPublicServices,
  getPublicSkillGroups,
  getPublicTestimonials,
  getSiteSettings,
  getPublicExperiences,
} from "@/server/queries/public";

export default async function HomePage(props: PageProps<"/[locale]">) {
  const locale = await resolveLocale(props.params);

  const [
    settings,
    hero,
    about,
    projects,
    skillGroups,
    services,
    experiences,
    testimonials,
    posts,
  ] = await Promise.all([
    getSiteSettings(),
    getHeroSection(),
    getAboutSection(),
    getPublicProjects(),
    getPublicSkillGroups(),
    getPublicServices(),
    getPublicExperiences(),
    getPublicTestimonials(),
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
      {hero ? <Hero hero={hero} locale={locale} /> : null}

      {about ? (
        <Section title={t("aboutTitle")}>
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
            <AnimatedIn>
              <Markdown
                content={pick(about, "bio", locale)}
                className="max-w-prose"
              />
            </AnimatedIn>
            <AnimatedIn delay={0.1}>
              <dl className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-5">
                {[
                  { value: about.yearsExperience, label: t("years") },
                  { value: about.projectsCount, label: t("projectsCount") },
                  { value: about.clientsCount, label: t("clientsCount") },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-heading text-3xl font-semibold tabular-nums">
                      {format.number(stat.value)}
                    </dt>
                    <dd className="text-sm text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimatedIn>
          </div>
        </Section>
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
          {/* Bento: the first project takes a double cell on desktop. */}
          <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
            {featured.map((project, index) => (
              <AnimatedIn
                key={project.id}
                delay={index * 0.05}
                className={index === 0 ? "md:col-span-2 md:row-span-2" : ""}
              >
                <ProjectCard
                  project={project}
                  locale={locale}
                  featured={index === 0}
                />
              </AnimatedIn>
            ))}
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

      {settings?.showServices ? (
        <ServicesSection
          services={services}
          locale={locale}
          title={t("services")}
          description={t("servicesDesc")}
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

      {settings?.showTestimonials ? (
        <TestimonialsSection
          testimonials={testimonials}
          locale={locale}
          title={t("testimonials")}
          description={t("testimonialsDesc")}
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
              <Link href="/contact">{t("ctaButton")}</Link>
            </Button>
          </div>
        </AnimatedIn>
      </Section>
    </>
  );
}
