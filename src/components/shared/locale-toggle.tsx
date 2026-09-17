"use client";

import { useTransition } from "react";
import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";

/**
 * Switches locale while staying on the exact same route (params included).
 */
export function LocaleToggle() {
  const t = useTranslations("Locale");
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("toggle")}
          disabled={isPending}
        >
          <LanguagesIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            disabled={locale === activeLocale}
            onSelect={() => {
              startTransition(() => {
                // `usePathname()` already carries resolved dynamic segments,
                // so the user lands on the same route in the other locale.
                router.replace(pathname, { locale });
              });
            }}
          >
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
