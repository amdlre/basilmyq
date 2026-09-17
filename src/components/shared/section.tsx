import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

/** The wrapper every public-site section uses, so rhythm stays consistent. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className={cn("mx-auto w-full max-w-6xl px-4", containerClassName)}>
        {eyebrow || title || description ? (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              {eyebrow ? (
                <p className="text-sm font-medium text-primary">{eyebrow}</p>
              ) : null}
              {title ? (
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance md:text-3xl">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="max-w-prose text-balance text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
