"use client";

import { CheckIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Uses the native share sheet when available, and copies the link otherwise. */
export function ShareButton({ title }: { title: string }) {
  const t = useTranslations("BlogPage");
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed by the user, or unavailable — fall through to copying.
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={() => void share()}>
      {copied ? <CheckIcon /> : <Share2Icon />}
      {t("share")}
    </Button>
  );
}
