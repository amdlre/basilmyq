import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Markdown } from "@/components/public/markdown";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";
import { yearsSince } from "@/lib/format";
import { pick, pickOptional } from "@/lib/i18n-content";

type HeroRow = Record<string, unknown> & {
  isAvailable: boolean;
  imageUrl: string | null;
  careerStartDate: Date | string | null;
  secondaryCtaUrl: string | null;
};

type AboutRow = Record<string, unknown> & {
  imageUrl: string | null;
};

type CardRow = Record<string, unknown> & {
  id: string;
  imageUrl: string | null;
};

type IntroProps = {
  hero: HeroRow;
  about: AboutRow | null;
  cards: CardRow[];
  cvUrl: string | null;
  /** Counted from the published projects, never typed by hand. */
  projectsCount: number;
  locale: AppLocale;
};

/**
 * The hero and the "about" block as one section: portrait on one side, the
 * pitch on the other, with the stats and the cards tucked under it.
 *
 * Nothing here is animated on entry — it holds the LCP element, and anything
 * starting at `opacity: 0` delays it until hydration.
 */
export async function Intro({
  hero,
  about,
  cards,
  cvUrl,
  projectsCount,
  locale,
}: IntroProps) {
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");
  const Arrow =
    getLocaleDirection(locale) === "rtl" ? ArrowLeftIcon : ArrowRightIcon;

  const badge = pickOptional(hero, "badge", locale);
  const availability = pickOptional(hero, "availabilityText", locale);
  const highlight = pickOptional(hero, "highlight", locale);
  const secondaryLabel = pickOptional(hero, "secondaryCtaLabel", locale);
  const portrait = hero.imageUrl ?? about?.imageUrl ?? null;

  // Both numbers are derived: the years from the career start date typed once
  // in the dashboard, the project count from the projects themselves. Neither
  // can drift out of date the way a hand-entered figure does.
  const years = yearsSince(hero.careerStartDate) ?? 0;

  const stats = [
    { value: projectsCount, label: t("projectsCount") },
    { value: years, label: t("years") },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* The pitch. */}
          <div className="space-y-6">
            {hero.isAvailable && availability ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                <span
                  className="size-1.5 rounded-full bg-success"
                  aria-hidden
                />
                {availability}
              </p>
            ) : badge ? (
              <p className="text-sm font-medium text-primary">{badge}</p>
            ) : null}

            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
              {pick(hero, "title", locale)}{" "}
              {highlight ? (
                // The accent sits behind the word rather than on it, so the
                // text keeps its contrast in both themes.
                <span className="relative inline-block">
                  <span
                    aria-hidden
                    className="absolute inset-x-[-0.15em] inset-y-[0.08em] -z-10 rounded-lg bg-primary/15"
                  />
                  {highlight}
                </span>
              ) : null}
            </h1>

            <p className="max-w-2xl text-lg text-balance text-muted-foreground">
              {pick(hero, "subtitle", locale)}
            </p>

            {about ? (
              <Markdown
                content={pick(about, "bio", locale)}
                className="max-w-prose text-muted-foreground"
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
              <div className="flex flex-wrap gap-3">
                {cvUrl ? (
                  <Button asChild size="lg">
                    {/* The route handler, not the file: it counts downloads. */}
                    <a href="/api/cv" download>
                      <DownloadIcon />
                      {tNav("downloadCv")}
                    </a>
                  </Button>
                ) : null}

                <Button asChild size="lg" variant="outline">
                  <Link href={hero.secondaryCtaUrl ?? "/contact"}>
                    {secondaryLabel ?? tNav("contact")}
                    <Arrow />
                  </Link>
                </Button>
              </div>

              {stats.length > 0 ? (
                <dl className="flex items-center gap-8">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="font-heading text-2xl font-semibold tabular-nums">
                        {stat.value}+
                      </dt>
                      <dd className="text-sm text-muted-foreground">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {cards.length > 0 ? (
              // The row spills past its column on wide screens, so the last
              // card overlaps the portrait the way the reference does.
              <div className="relative z-10 grid grid-cols-3 gap-4 pt-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="relative h-24 overflow-hidden rounded-2xl bg-muted/80 backdrop-blur-sm sm:h-30"
                  >
                    <p className="relative z-10 p-4 font-heading text-xs font-medium text-balance">
                      {pick(card, "title", locale)}
                    </p>
                    {card.imageUrl ? (
                      // Fills the lower half and runs past the bottom edge, so
                      // the card crops it rather than framing it.
                      <div className="absolute inset-x-3 top-12 bottom-0">
                        <Image
                          src={card.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 260px"
                          className="object-contain object-bottom"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* The portrait. */}
          {portrait ? (
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl lg:aspect-3/4">
              <Image
                src={portrait}
                alt={pick(hero, "title", locale)}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
