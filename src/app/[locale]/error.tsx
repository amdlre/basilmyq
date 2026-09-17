"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is what ties this screen to the server log entry.
    console.error("Route error", error.digest ?? error.message);
  }, [error]);

  const t = useTranslations("ErrorPage");

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        {t("description")}
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>
          <RotateCcwIcon />
          {t("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-4 text-xs text-muted-foreground/60" dir="ltr">
          {error.digest}
        </p>
      ) : null}
    </main>
  );
}
