"use client";

import type { Row } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { TableDensity } from "./types";

type SortableRowProps<TData> = {
  row: Row<TData>;
  rowId: string;
  enableReorder: boolean;
  density: TableDensity;
};

export function SortableRow<TData>({
  row,
  rowId,
  enableReorder,
  density,
}: SortableRowProps<TData>) {
  const t = useTranslations("DataTable");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowId, disabled: !enableReorder });

  return (
    <TableRow
      ref={setNodeRef}
      data-state={row.getIsSelected() ? "selected" : undefined}
      style={{
        transform: CSS.Transform.toString(
          transform ? { ...transform, x: 0, scaleX: 1, scaleY: 1 } : null,
        ),
        transition,
      }}
      className={cn(isDragging && "relative z-10 bg-muted shadow-sm")}
    >
      {enableReorder ? (
        <TableCell
          className={cn("w-8 ps-3 pe-0", density === "compact" && "py-1.5")}
        >
          <button
            type="button"
            aria-label={t("reorderRow")}
            className="cursor-grab touch-none text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        </TableCell>
      ) : null}

      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className={cn(
            density === "compact" ? "py-1.5" : "py-3",
            cell.column.columnDef.meta?.align === "end" && "text-end",
            cell.column.columnDef.meta?.align === "center" && "text-center",
            cell.column.columnDef.meta?.pinned &&
              "sticky end-0 z-10 bg-background",
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
