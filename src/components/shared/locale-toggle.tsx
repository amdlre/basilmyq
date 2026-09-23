"use client";

import { useState } from "react";
import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";
import { LOCALES, type AppLocale } from "@/i18n/routing";

/**
 * Switches locale while staying on the exact same route (params included).
 *
 * With exactly two languages a menu is a list of one real choice, so this is a
 * button instead: it names the language you would land in, not the one you are
 * already reading.
 *
 * The navigation is deliberately a full page load rather than a client-side
 * one. `lang`, `dir` and the font variables all live on `<html>`, and a soft
 * navigation makes React re-render that element on the client — which is what
 * logged "Encountered a script tag while rendering React component" for the
 * inline theme script sitting inside it. A language change is the one moment a
 * fresh document is the honest answer: the whole page is being replaced.
 */
export function LocaleToggle() {
  const t = useTranslations("Locale");
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);

  const target =
    LOCALES.find((locale) => locale !== activeLocale) ?? activeLocale;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t("switchTo", { language: t(target) })}
      disabled={isLeaving}
      onClick={() => {
        setIsLeaving(true);
        // `usePathname()` is the route without its locale prefix and already
        // carries resolved dynamic segments, so the reader lands on the same
        // page in the other language. The query string comes along with it.
        const route = pathname === "/" ? "" : pathname;
        // The rule's advice — `useRouter().push()` — is exactly what causes
        // the bug this avoids: a soft navigation re-renders `<html>`. The full
        // load is the point, not an oversight.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(
          `/${target}${route}${window.location.search}${window.location.hash}`,
        );
      }}
    >
      <LanguagesIcon className="size-4" />
      <span aria-hidden className="text-xs font-semibold">
        {t(`short.${target}`)}
      </span>
    </Button>
  );
}
