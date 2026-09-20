import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";
import { pick, pickOptional } from "@/lib/i18n-content";

type HeroRow = Record<string, unknown> & {
  isAvailable: boolean;
  primaryCtaUrl: string | null;
  secondaryCtaUrl: string | null;
};

export function Hero({ hero, locale }: { hero: HeroRow; locale: AppLocale }) {
  const Arrow =
    getLocaleDirection(locale) === "rtl" ? ArrowLeftIcon : ArrowRightIcon;

  const badge = pickOptional(hero, "badge", locale);
  const availability = pickOptional(hero, "availabilityText", locale);
  const primaryLabel = pickOptional(hero, "primaryCtaLabel", locale);
  const secondaryLabel = pickOptional(hero, "secondaryCtaLabel", locale);

  return (
    // The accent wash lives in the layout, so it runs behind the floating
    // header instead of starting below it.
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-24 md:py-36">
        {/*
          Deliberately not animated: this block holds the LCP element, and a
          fade-in would hold it at opacity 0 until hydration finishes.
        */}
        <div className="max-w-3xl space-y-6">
          {hero.isAvailable && availability ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              {availability}
            </p>
          ) : badge ? (
            <p className="text-sm font-medium text-primary">{badge}</p>
          ) : null}

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {pick(hero, "title", locale)}
          </h1>

          <p className="max-w-2xl text-lg text-balance text-muted-foreground">
            {pick(hero, "subtitle", locale)}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {primaryLabel && hero.primaryCtaUrl ? (
              <Button asChild size="lg">
                <Link href={hero.primaryCtaUrl}>
                  {primaryLabel}
                  <Arrow />
                </Link>
              </Button>
            ) : null}
            {secondaryLabel && hero.secondaryCtaUrl ? (
              <Button asChild size="lg" variant="outline">
                <Link href={hero.secondaryCtaUrl}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
