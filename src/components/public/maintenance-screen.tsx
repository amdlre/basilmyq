"use client";

import type { ReactNode } from "react";
import { WrenchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type MaintenanceScreenProps = {
  /** Falls back to the domain when settings cannot be read. */
  siteName?: string | null;
  /** Only offered when the database answered — during an outage there is none. */
  email?: string | null;
  /** The retry button, supplied by the error boundary. */
  action?: ReactNode;
  /** Ties the screen to the server log entry. */
  digest?: string | null;
};

/**
 * Shown both when maintenance mode is on and when the database cannot be
 * reached, so it has to stand on its own: no navbar, no footer, and no
 * assumption that any site content is available.
 *
 * Defined once and used by the public layout and the error boundary alike —
 * the two used to carry their own copy of this markup.
 */
export function MaintenanceScreen({
  siteName,
  email,
  action,
  digest,
}: MaintenanceScreenProps) {
  const t = useTranslations("Maintenance");

  return (
    <main
      id="main-content"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16"
    >
      {/* The same accent wash the site uses, so this still reads as the brand. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-gradient-to-b from-primary/10 to-transparent"
      />

      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="font-heading text-sm font-semibold tracking-tight text-muted-foreground">
          {siteName || "basilmyq.com"}
        </p>

        <div className="relative mt-8 mb-7 flex size-20 items-center justify-center">
          {/* A slow pulse says "in progress" without demanding attention. */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/10 motion-safe:animate-ping motion-safe:[animation-duration:3s]"
          />
          <span
            aria-hidden
            className="absolute inset-2 rounded-full bg-primary/10"
          />
          <WrenchIcon className="relative size-7 text-primary" />
        </div>

        <p className="mb-3 rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          {t("badge")}
        </p>

        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          {t("title")}
        </h1>

        <p className="mt-3 text-balance text-muted-foreground">
          {t("description")}
        </p>

        {action ? <div className="mt-7">{action}</div> : null}

        {email ? (
          <div className="mt-10 w-full border-t border-border/60 pt-6 text-sm">
            <p className="text-muted-foreground">
              {t("contactLead")}{" "}
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {email}
              </a>
            </p>
          </div>
        ) : null}

        {digest ? (
          <p className="mt-8 text-xs text-muted-foreground/50" dir="ltr">
            {digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
