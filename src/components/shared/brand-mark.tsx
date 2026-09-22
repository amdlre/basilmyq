import Image from "next/image";
import { ShapesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  name: string;
  /** Settings → General logo for the active language; the name alone if unset. */
  logoUrl: string | null;
  /**
   * `full` is the logo beside the name. `mark` is the logo alone in a square,
   * for places with room for one glyph — the collapsed dashboard sidebar.
   */
  variant?: "full" | "mark";
  /** Above the fold in the header, so it loads eagerly there. */
  eager?: boolean;
  className?: string;
};

/** The site logo and name, written once for the header, menu and footer. */
export function BrandMark({
  name,
  logoUrl,
  variant = "full",
  eager = false,
  className,
}: BrandMarkProps) {
  if (variant === "mark") {
    return (
      <span
        className={cn(
          "inline-flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg",
          logoUrl ? null : "bg-sidebar-foreground/15",
          className,
        )}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={32}
            height={32}
            loading={eager ? "eager" : "lazy"}
            className="size-full object-contain"
          />
        ) : (
          <ShapesIcon className="size-4" />
        )}
        {/* The square carries no text, so the name is left for screen readers. */}
        <span className="sr-only">{name}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          // The name is rendered right beside it, so the image is decorative.
          alt=""
          width={96}
          height={32}
          loading={eager ? "eager" : "lazy"}
          className="h-8 w-auto object-contain"
        />
      ) : null}
      <span className="font-heading font-semibold tracking-tight">{name}</span>
    </span>
  );
}
