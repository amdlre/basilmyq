import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppLocale } from "@/i18n/routing";
import { toDate } from "@/lib/format";
import { pick, pickOptional } from "@/lib/i18n-content";

type ExperienceRow = Record<string, unknown> & {
  id: string;
  // Cached queries serialise dates, so both shapes have to be accepted.
  startDate: Date | string;
  endDate: Date | string | null;
  isCurrent: boolean;
};

export function TimelineSection({
  experiences,
  locale,
  title,
  description,
  presentLabel,
  currentLabel,
  bare = false,
}: {
  experiences: ExperienceRow[];
  locale: AppLocale;
  title: string;
  description?: string;
  presentLabel: string;
  currentLabel: string;
  /** Renders the list alone, for pages that supply their own heading. */
  bare?: boolean;
}) {
  if (experiences.length === 0) return null;

  const formatYear = (value: Date | string | null): string => {
    const date = toDate(value);
    return date
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
          year: "numeric",
          month: "short",
        }).format(date)
      : presentLabel;
  };

  const list = (
    // The rail sits on the inline-start edge, so it mirrors with the direction.
    <ol className="relative space-y-8 border-s border-border ps-6">
      {experiences.map((experience, index) => (
        <li key={experience.id} className="relative">
          <AnimatedIn delay={index * 0.05}>
            <span
              aria-hidden
              className="absolute -start-[1.9rem] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-[var(--background)]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-semibold">
                {pick(experience, "role", locale)}
              </h3>
              {experience.isCurrent ? (
                <StatusBadge label={currentLabel} tone="success" />
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {pick(experience, "company", locale)}
              {pickOptional(experience, "location", locale)
                ? ` · ${pickOptional(experience, "location", locale)}`
                : ""}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatYear(experience.startDate)} —{" "}
              {formatYear(experience.endDate)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-balance">
              {pick(experience, "description", locale)}
            </p>
          </AnimatedIn>
        </li>
      ))}
    </ol>
  );

  if (bare) return list;

  return (
    <Section title={title} description={description}>
      {list}
    </Section>
  );
}
