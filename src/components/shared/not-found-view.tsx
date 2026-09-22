import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NotFoundViewProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: ComponentProps<typeof Link>["href"];
  className?: string;
};

/**
 * The one 404 screen. Both the segment `not-found` and the routing-level
 * `global-not-found` render this, so a missing page looks the same wherever it
 * is caught.
 */
export function NotFoundView({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: NotFoundViewProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center",
        className,
      )}
    >
      {/* The digits flank the drawing, and read the same in both directions. */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <Digit>4</Digit>
        <LostIllustration />
        <Digit>4</Digit>
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-sm text-balance text-muted-foreground">
          {description}
        </p>
      </div>

      <Button asChild size="lg">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

function Digit({ children }: { children: string }) {
  return (
    <span className="font-heading text-[5.5rem] leading-none font-bold tracking-tighter text-foreground/15 tabular-nums select-none sm:text-[8rem]">
      {children}
    </span>
  );
}

/**
 * Drawn rather than uploaded: an SVG costs no request, scales to any size and
 * takes its colours from the theme, so it follows the accent and works on
 * either background. `currentColor` is the muted line, `--primary` the accent.
 */
function LostIllustration() {
  return (
    <svg
      viewBox="0 0 128 128"
      role="presentation"
      aria-hidden
      className="size-28 shrink-0 text-muted-foreground sm:size-40"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* The empty page: a sheet with a folded corner and nothing on it. */}
      <path
        d="M20 18h36l16 16v72a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6Z"
        className="fill-muted/50 stroke-current"
        strokeWidth="3.5"
      />
      <path
        d="M56 18v10a6 6 0 0 0 6 6h10"
        className="stroke-current"
        strokeWidth="3.5"
      />
      <path
        d="M26 50h28M26 62h18"
        className="stroke-current opacity-40"
        strokeWidth="3.5"
      />

      {/* The search that came back empty, drawn over the page. */}
      <circle
        cx="82"
        cy="78"
        r="26"
        className="fill-background stroke-primary"
        strokeWidth="5"
      />
      <path d="m101 97 15 15" className="stroke-primary" strokeWidth="7" />
      <circle cx="73" cy="71" r="3.5" className="fill-primary" />
      <circle cx="91" cy="71" r="3.5" className="fill-primary" />
      {/* A flat mouth: nothing found, and not thrilled about it. */}
      <path
        d="M73 89h18"
        className="stroke-primary opacity-70"
        strokeWidth="3.5"
      />
    </svg>
  );
}
