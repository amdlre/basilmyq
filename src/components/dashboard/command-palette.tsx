"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";

/** Anything can ask for the palette by dispatching this on `window`. */
export const OPEN_COMMAND_PALETTE_EVENT = "basilmyq:open-command-palette";

export function openCommandPalette(): void {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}

/** ⌘K / Ctrl+K quick navigation, reading the same nav definition as the sidebar. */
export function CommandPalette() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    const onOpenRequest = () => setOpen(true);

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenRequest);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenRequest);
    };
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("dashboard.commandTitle")}
      description={t("dashboard.commandDescription")}
    >
      {/*
        This shadcn build's CommandDialog renders only a Dialog around its
        children, so the cmdk provider has to be supplied here. Without it
        CommandInput/CommandList have no store and crash on subscribe.
      */}
      <Command>
        <CommandInput placeholder={t("dashboard.commandPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("dashboard.commandEmpty")}</CommandEmpty>
          {DASHBOARD_NAV.map((group) => (
            <CommandGroup
              key={group.labelKey}
              heading={t(`dashboard.groups.${group.labelKey}`)}
            >
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={t(`dashboard.${item.labelKey}`)}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <item.icon className="size-4" />
                  {t(`dashboard.${item.labelKey}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
