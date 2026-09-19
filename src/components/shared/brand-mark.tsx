import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  name: string;
  /** Settings → General logo for the active language; the name alone if unset. */
  logoUrl: string | null;
  /** Above the fold in the header, so it loads eagerly there. */
  eager?: boolean;
  className?: string;
};

/** The site logo and name, written once for the header, menu and footer. */
export function BrandMark({
  name,
  logoUrl,
  eager = false,
  className,
}: BrandMarkProps) {
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
