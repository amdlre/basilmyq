"use client";

import { useState, useTransition } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { RowAction } from "./types";

type RowActionsProps<TData> = {
  row: TData;
  actions: RowAction<TData>[];
};

export function RowActions<TData>({ row, actions }: RowActionsProps<TData>) {
  const t = useTranslations("DataTable");
  const [pendingAction, setPendingAction] = useState<RowAction<TData> | null>(
    null,
  );
  const [isRunning, startTransition] = useTransition();

  const visible = actions.filter((action) => !action.hidden?.(row));
  if (visible.length === 0) return null;

  const labelOf = (action: RowAction<TData>) =>
    typeof action.label === "function" ? action.label(row) : action.label;

  const run = (action: RowAction<TData>) => {
    startTransition(async () => {
      await action.run(row);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("rowActions")}
            disabled={isRunning}
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visible.map((action) => (
            <DropdownMenuItem
              key={action.id}
              variant={
                action.variant === "destructive" ? "destructive" : "default"
              }
              onSelect={() => {
                // Rule 9: destructive actions always pass through a confirm step.
                if (action.confirm) {
                  setPendingAction(action);
                  return;
                }
                run(action);
              }}
            >
              {action.icon ? <action.icon className="size-4" /> : null}
              {labelOf(action)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        status={pendingAction?.variant === "destructive" ? "error" : "warning"}
        confirmLabel={pendingAction ? labelOf(pendingAction) : undefined}
        onConfirm={() => {
          if (pendingAction) run(pendingAction);
          setPendingAction(null);
        }}
      />
    </>
  );
}
