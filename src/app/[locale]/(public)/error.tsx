"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * Almost every public page reads from the database, so the realistic failure
 * here is that the database is down or not seeded yet. Visitors get the
 * maintenance screen rather than the host's "Bad Gateway"; the digest ties it
 * to the server log.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public route error", error.digest ?? error.message);
  }, [error]);

  const t = useTranslations("Maintenance");
  const tError = useTranslations("ErrorPage");

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        {t("description")}
      </p>
      <Button className="mt-2" onClick={reset}>
        <RotateCcwIcon />
        {tError("retry")}
      </Button>
      {error.digest ? (
        <p className="mt-4 text-xs text-muted-foreground/60" dir="ltr">
          {error.digest}
        </p>
      ) : null}
    </main>
  );
}
