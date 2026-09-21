"use client";

import { useOptimistic, useState, useTransition } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DropdownToggleItem } from "@/components/shared/dropdown-toggle-item";
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
        <DropdownMenuContent align="end" className="min-w-48">
          {visible.map((action) =>
            action.toggle ? (
              <ToggleActionItem
                key={action.id}
                row={row}
                action={action}
                label={labelOf(action)}
              />
            ) : (
              <DropdownMenuItem
                key={action.id}
                className="gap-2 px-2 py-1.5"
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
            ),
          )}
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

/**
 * A row action rendered as a switch. The state comes from the row, so it only
 * settles once the server action and the refresh land; `useOptimistic` flips it
 * under the finger and puts it back by itself if the write failed.
 */
function ToggleActionItem<TData>({
  row,
  action,
  label,
}: {
  row: TData;
  action: RowAction<TData>;
  label: string;
}) {
  const checked = action.toggle?.(row) ?? false;
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [isRunning, startTransition] = useTransition();

  return (
    <DropdownToggleItem
      checked={optimistic}
      disabled={isRunning}
      onCheckedChange={(next) => {
        // The write runs inside this transition, not the parent's, so the
        // optimistic value holds until the refreshed row arrives.
        startTransition(async () => {
          setOptimistic(next);
          await action.run(row);
        });
      }}
    >
      {action.icon ? <action.icon className="size-4" /> : null}
      {label}
    </DropdownToggleItem>
  );
}
