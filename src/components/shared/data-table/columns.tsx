"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import { RowActions } from "./row-actions";
import type { RowAction } from "./types";

/**
 * The selection column, defined once. Modules spread it into their column
 * array rather than re-declaring checkboxes.
 */
export function createSelectionColumn<TData>(labels: {
  selectAll: string;
  selectRow: string;
}): ColumnDef<TData, unknown> {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: { excludeFromExport: true, label: "" },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label={labels.selectAll}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={labels.selectRow}
      />
    ),
  };
}

/** The pinned `⋯` column, defined once. */
export function createActionsColumn<TData>(
  actions: RowAction<TData>[],
  label: string,
): ColumnDef<TData, unknown> {
  return {
    id: "actions",
    size: 56,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: { excludeFromExport: true, pinned: true, label, align: "end" },
    header: () => <span className="sr-only">{label}</span>,
    cell: ({ row }) => <RowActions row={row.original} actions={actions} />,
  };
}
