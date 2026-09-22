"use client";

import { useTransition } from "react";
import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, type AppLocale } from "@/i18n/routing";

/**
 * Switches locale while staying on the exact same route (params included).
 *
 * With exactly two languages a menu is a list of one real choice, so this is a
 * button instead: it names the language you would land in, not the one you are
 * already reading.
 */
export function LocaleToggle() {
  const t = useTranslations("Locale");
  const activeLocale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const target =
    LOCALES.find((locale) => locale !== activeLocale) ?? activeLocale;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t("switchTo", { language: t(target) })}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          // `usePathname()` already carries resolved dynamic segments, so the
          // user lands on the same route in the other locale.
          router.replace(pathname, { locale: target });
        });
      }}
    >
      <LanguagesIcon className="size-4" />
      <span aria-hidden className="text-xs font-semibold">
        {t(`short.${target}`)}
      </span>
    </Button>
  );
}
