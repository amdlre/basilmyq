"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CopyIcon, ImageIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/format";
import { deleteMedia } from "@/server/actions/media";
import type { MediaRow } from "@/server/queries/dashboard";

/** A gallery rather than a table — media is looked at, not read. */
export function MediaClient({ rows }: { rows: MediaRow[] }) {
  const t = useTranslations("Media");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [pending, setPending] = useState<MediaRow | null>(null);
  const [, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title={t("empty")}
        description={t("emptyHint")}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <Card key={row.id} className="overflow-hidden p-0">
            <div className="relative aspect-video bg-muted">
              {row.mimeType.startsWith("image/") ? (
                <Image
                  src={row.url}
                  alt={
                    (locale === "ar" ? row.altAr : row.altEn) ?? row.filename
                  }
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>
            <CardContent className="space-y-2 p-3">
              <p className="truncate text-sm font-medium" dir="ltr">
                {row.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(row.size, locale)}
                {row.width && row.height ? ` · ${row.width}×${row.height}` : ""}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    await navigator.clipboard.writeText(row.url);
                    toast.success(t("copied"));
                  }}
                >
                  <CopyIcon />
                  {t("copyUrl")}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={tCommon("delete")}
                  onClick={() => setPending(row)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={tCommon("delete")}
        itemName={pending?.filename}
        variant="destructive"
        onConfirm={() => {
          const target = pending;
          setPending(null);
          if (!target) return;
          startTransition(async () => {
            await deleteMedia([target.id]);
            toast.success(tCommon("deleted"));
          });
        }}
      />
    </>
  );
}
