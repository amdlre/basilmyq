"use client";

import { useTransition } from "react";
import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { logout } from "@/server/actions/auth";

export function LogoutButton() {
  const t = useTranslations("Dashboard");
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("logout")}
      disabled={isPending}
      onClick={() => startTransition(() => void logout())}
    >
      <LogOutIcon className="size-4" />
    </Button>
  );
}
