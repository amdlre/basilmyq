"use client";

import type { Header } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortableHeaderCellProps<TData> = {
  header: Header<TData, unknown>;
  canReorder: boolean;
};

/** A header cell that can be dragged to reorder its column, and resized. */
export function SortableHeaderCell<TData>({
  header,
  canReorder,
}: SortableHeaderCellProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: header.column.id, disabled: !canReorder });

  const isPinned = header.column.columnDef.meta?.pinned;

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={{
        width: header.getSize(),
        // Only translate along X — rows must not shift vertically.
        transform: CSS.Translate.toString(
          transform ? { ...transform, y: 0, scaleX: 1, scaleY: 1 } : null,
        ),
        opacity: isDragging ? 0.75 : 1,
      }}
      className={cn(
        "group/head relative select-none",
        isDragging && "z-20",
        isPinned && "sticky end-0 z-10 bg-background",
      )}
    >
      <div className="flex items-center gap-1">
        {canReorder ? (
          <button
            type="button"
            className="cursor-grab text-muted-foreground/0 transition-colors group-hover/head:text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
            tabIndex={-1}
            aria-hidden
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        ) : null}

        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>

      {header.column.getCanResize() ? (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute inset-y-0 end-0 w-1 cursor-col-resize touch-none select-none",
            "bg-border/0 transition-colors hover:bg-border",
            header.column.getIsResizing() && "bg-primary",
          )}
        />
      ) : null}
    </TableHead>
  );
}
