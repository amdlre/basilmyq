"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { MaintenanceScreen } from "@/components/public/maintenance-screen";
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

  const t = useTranslations("ErrorPage");

  return (
    <MaintenanceScreen
      digest={error.digest}
      action={
        <Button onClick={reset}>
          <RotateCcwIcon />
          {t("retry")}
        </Button>
      }
    />
  );
}
