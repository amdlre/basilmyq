"use client";

import { useState, useTransition } from "react";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { BulkAction } from "./types";

type BulkBarProps<TData> = {
  selectedRows: TData[];
  actions: BulkAction<TData>[];
  onClear: () => void;
};

/** Floating bar that appears only while rows are selected. */
export function BulkBar<TData>({
  selectedRows,
  actions,
  onClear,
}: BulkBarProps<TData>) {
  const t = useTranslations("DataTable");
  const [pending, setPending] = useState<BulkAction<TData> | null>(null);
  const [isRunning, startTransition] = useTransition();

  if (selectedRows.length === 0) return null;

  const run = (action: BulkAction<TData>) => {
    startTransition(async () => {
      await action.run(selectedRows);
      onClear();
    });
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-popover p-1.5 ps-4 text-popover-foreground shadow-lg">
          <span className="text-sm font-medium whitespace-nowrap">
            {t("selectedCount", { count: selectedRows.length })}
          </span>

          {actions.length > 0 ? (
            <Separator orientation="vertical" className="h-5" />
          ) : null}

          {actions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={
                action.variant === "destructive" ? "destructive" : "ghost"
              }
              disabled={isRunning}
              className="rounded-full"
              onClick={() => {
                if (action.confirm) {
                  setPending(action);
                  return;
                }
                run(action);
              }}
            >
              {action.icon ? <action.icon className="size-4" /> : null}
              {action.label}
            </Button>
          ))}

          <Separator orientation="vertical" className="h-5" />
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-full"
            aria-label={t("clearSelection")}
            onClick={onClear}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        itemName={t("selectedCount", { count: selectedRows.length })}
        status={pending?.variant === "destructive" ? "error" : "warning"}
        confirmLabel={pending?.label}
        onConfirm={() => {
          if (pending) run(pending);
          setPending(null);
        }}
      />
    </>
  );
}
