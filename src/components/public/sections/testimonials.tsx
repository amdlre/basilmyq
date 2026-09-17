"use client";

import { StarIcon } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import type { AppLocale } from "@/i18n/routing";
import { pick, pickOptional } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

type TestimonialRow = Record<string, unknown> & {
  id: string;
  rating: number;
};

/**
 * A marquee that pauses on hover and stops entirely under
 * `prefers-reduced-motion`, where it becomes a plain scrollable row.
 */
export function TestimonialsSection({
  testimonials,
  locale,
  title,
  description,
}: {
  testimonials: TestimonialRow[];
  locale: AppLocale;
  title: string;
  description?: string;
}) {
  if (testimonials.length === 0) return null;

  // Duplicated once so the loop has no visible seam.
  const track = [...testimonials, ...testimonials];

  return (
    <Section
      title={title}
      description={description}
      className="overflow-hidden bg-muted/30"
      containerClassName="max-w-none px-0"
    >
      <div className="group relative">
        <div
          className={cn(
            "flex w-max gap-4 px-4",
            "motion-safe:animate-[marquee_45s_linear_infinite]",
            "motion-safe:group-hover:[animation-play-state:paused]",
            "motion-reduce:w-full motion-reduce:overflow-x-auto",
          )}
        >
          {track.map((testimonial, index) => (
            <Card
              key={`${testimonial.id}-${index}`}
              className="w-[19rem] shrink-0"
              aria-hidden={index >= testimonials.length}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <StarIcon
                      key={star}
                      className={cn(
                        "size-3.5",
                        star < testimonial.rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-balance">
                  “{pick(testimonial, "quote", locale)}”
                </p>
                <div className="pt-1">
                  <p className="text-sm font-medium">
                    {pick(testimonial, "name", locale)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      pickOptional(testimonial, "role", locale),
                      pickOptional(testimonial, "company", locale),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
