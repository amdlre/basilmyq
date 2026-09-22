import type { Metadata } from "next";
import Image from "next/image";
import { DownloadIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Markdown } from "@/components/public/markdown";
import { TimelineSection } from "@/components/public/sections/timeline";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { resolveLocale } from "@/i18n/resolve-locale";
import { BLUR_DATA_URL } from "@/lib/blur";
import { pick } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import {
  getAboutSection,
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
  const [about, experiences, settings] = await Promise.all([
    getAboutSection(),
    getPublicExperiences(),
    getSiteSettings(),
  ]);

  const t = await getTranslations("AboutPage");
  const tExp = await getTranslations("Experience");

  const cvUrl = settings?.cvUrl ?? null;

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

    </>
  );
}
