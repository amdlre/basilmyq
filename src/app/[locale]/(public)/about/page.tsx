import type { Metadata } from "next";
import Image from "next/image";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Markdown } from "@/components/public/markdown";
import { TimelineSection } from "@/components/public/sections/timeline";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { resolveLocale } from "@/i18n/resolve-locale";
import { toDate } from "@/lib/format";
import { BLUR_DATA_URL } from "@/lib/blur";
import { pick, pickOptional } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import {
  getAboutSection,
  getPublicEducation,
  getPublicExperiences,
  getSiteSettings,
} from "@/server/queries/public";

export async function generateMetadata(
  props: PageProps<"/[locale]/about">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const [about, t] = await Promise.all([
    getAboutSection(),
    getTranslations({ locale, namespace: "AboutPage" }),
  ]);

  return buildMetadata({
    locale,
    path: "/about",
    title: about ? pick(about, "title", locale) : t("title"),
    description: t("description"),
    image: about?.imageUrl,
  });
}

export default async function AboutPage(props: PageProps<"/[locale]/about">) {
  const locale = await resolveLocale(props.params);
  const [about, experiences, education, settings] = await Promise.all([
    getAboutSection(),
    getPublicExperiences(),
    getPublicEducation(),
    getSiteSettings(),
  ]);

  const t = await getTranslations("AboutPage");
  const tExp = await getTranslations("Experience");
  const tEdu = await getTranslations("Education");

  const cvUrl = settings?.cvUrl ?? null;

  const formatYear = (value: Date | string | null): string => {
    const date = toDate(value);
    return date ? String(date.getFullYear()) : tExp("present");
  };

  return (
    <>
      <Section title={about ? pick(about, "title", locale) : t("title")}>
        <div className="grid gap-10 md:grid-cols-[1fr_16rem] md:items-start">
          <AnimatedIn>
            {about ? (
              <Markdown
                content={pick(about, "bio", locale)}
                className="max-w-prose text-lg"
              />
            ) : null}

            {cvUrl ? (
              <Button asChild size="lg" className="mt-8">
                <a href="/api/cv" download>
                  <DownloadIcon />
                  {t("downloadCv")}
                </a>
              </Button>
            ) : null}
          </AnimatedIn>

          {about?.imageUrl ? (
            <AnimatedIn delay={0.1}>
              <Image
                src={about.imageUrl}
                alt={pick(about, "title", locale)}
                width={512}
                height={640}
                className="w-full rounded-xl object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </AnimatedIn>
          ) : null}
        </div>
      </Section>

      <TimelineSection
        experiences={experiences}
        locale={locale}
        title={t("experience")}
        presentLabel={tExp("present")}
        currentLabel={tExp("current")}
      />

      {education.length > 0 ? (
        <Section title={t("education")} className="bg-muted/30">
          <ul className="grid gap-4 md:grid-cols-2">
            {education.map((entry, index) => (
              <li
                key={entry.id}
                className="h-full rounded-xl border bg-card p-5"
              >
                <AnimatedIn delay={index * 0.05}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading font-semibold text-balance">
                      {pick(entry, "degree", locale)}
                    </h3>
                    <StatusBadge
                      label={
                        entry.type === "DEGREE"
                          ? tEdu("type.DEGREE")
                          : tEdu("type.CERTIFICATE")
                      }
                      tone={entry.type === "DEGREE" ? "accent" : "neutral"}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pick(entry, "school", locale)}
                  </p>
                  {pickOptional(entry, "field", locale) ? (
                    <p className="text-sm text-muted-foreground">
                      {pickOptional(entry, "field", locale)}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                    {formatYear(entry.startDate)} — {formatYear(entry.endDate)}
                  </p>
                  {entry.credentialUrl ? (
                    <Button
                      asChild
                      variant="link"
                      size="sm"
                      className="-ms-3 mt-2"
                    >
                      <a
                        href={entry.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("credential")}
                        <ExternalLinkIcon />
                      </a>
                    </Button>
                  ) : null}
                </AnimatedIn>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
