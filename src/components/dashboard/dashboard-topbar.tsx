"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { openCommandPalette } from "./command-palette";
import { LogoutButton } from "./logout-button";

type DashboardTopbarProps = {
  email: string;
};

export function DashboardTopbar({ email }: DashboardTopbarProps) {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="me-1 h-4" />

      {/*
        Wrapped rather than given `flex-1`: the shadcn Button carries `shrink-0`
        in its base styles, so the shrinking has to happen on a container or the
        bar overflows on a phone.
      */}
      <div className="min-w-0 flex-1 sm:max-w-56">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 font-normal text-muted-foreground"
          onClick={openCommandPalette}
        >
          <SearchIcon className="size-4" />
          <span className="truncate">{t("dashboard.commandPlaceholder")}</span>
          <kbd className="ms-auto hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </Button>
      </div>

      <div className="ms-auto flex shrink-0 items-center gap-1">
        <span
          dir="ltr"
          className="me-1 hidden text-xs text-muted-foreground lg:inline"
        >
          {email}
        </span>
        <ThemeToggle />
        <LocaleToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
