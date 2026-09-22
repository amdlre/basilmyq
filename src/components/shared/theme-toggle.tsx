"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * One button, two states. There is no "system" entry: the first visit still
 * follows the operating system through `defaultTheme`, and the moment anyone
 * presses this they have chosen a side, which is the only thing the control
 * needs to express.
 */
export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggle")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/*
        The active theme is expressed in CSS rather than state, so the button
        renders identically on the server and the client — no mount guard, no
        hydration mismatch. `resolvedTheme` is only read on click, by which
        time it has settled.
      */}
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="hidden size-4 dark:block" />
    </Button>
  );
}
