"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, EyeIcon, EyeOffIcon, StarIcon } from "lucide-react";

import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  createActionsColumn,
  createSelectionColumn,
} from "@/components/shared/data-table/columns";
import type { RowAction } from "@/components/shared/data-table/types";
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";

import type { DemoRow } from "./demo-data";

const STATUS_TONES: Record<DemoRow["status"], StatusTone> = {
  COMPLETED: "success",
  IN_PROGRESS: "accent",
  DRAFT: "warning",
  ARCHIVED: "neutral",
};

type BuildColumnsArgs = {
  locale: "ar" | "en";
  labels: {
    selectAll: string;
    selectRow: string;
    actions: string;
    title: string;
    status: string;
    category: string;
    tags: string;
    year: string;
    views: string;
    visibility: string;
    featured: string;
    visible: string;
    hidden: string;
    yes: string;
    statusLabels: Record<DemoRow["status"], string>;
    categoryLabels: Record<string, string>;
  };
  rowActions: RowAction<DemoRow>[];
};

/**
 * A module contributes only this: column definitions. Everything else —
 * search, filters, selection, export, pagination, cards on mobile — comes
 * from DataTable itself.
 */
export function buildDemoColumns({
  locale,
  labels,
  rowActions,
}: BuildColumnsArgs): ColumnDef<DemoRow, unknown>[] {
  return [
    createSelectionColumn<DemoRow>(labels),

    {
      accessorKey: locale === "ar" ? "titleAr" : "titleEn",
      id: "title",
      size: 260,
      meta: { label: labels.title, cardTitle: true },
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.title} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">
            {locale === "ar" ? row.original.titleAr : row.original.titleEn}
          </span>
          {row.original.isFeatured ? (
            <StarIcon className="size-3.5 shrink-0 text-warning" />
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "status",
      id: "status",
      size: 130,
      meta: {
        label: labels.status,
        exportValue: (row) =>
          labels.statusLabels[(row as DemoRow).status] ?? "",
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.status} />
      ),
      cell: ({ row }) => (
        <StatusBadge
          label={labels.statusLabels[row.original.status] ?? ""}
          tone={STATUS_TONES[row.original.status]}
        />
      ),
    },

    {
      accessorKey: "category",
      id: "category",
      size: 150,
      meta: {
        label: labels.category,
        exportValue: (row) =>
          labels.categoryLabels[(row as DemoRow).category] ?? "",
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.category} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {labels.categoryLabels[row.original.category] ??
            row.original.category}
        </span>
      ),
    },

    {
      accessorKey: "tags",
      id: "tags",
      size: 200,
      enableSorting: false,
      meta: {
        label: labels.tags,
        exportValue: (row) => (row as DemoRow).tags.join(", "),
      },
      header: () => <span className="font-medium">{labels.tags}</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },

    {
      accessorKey: "year",
      id: "year",
      size: 90,
      meta: { label: labels.year, align: "end" },
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.year} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.year}</span>
      ),
    },

    {
      accessorKey: "views",
      id: "views",
      size: 110,
      meta: { label: labels.views, align: "end" },
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.views} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.views.toLocaleString(
            locale === "ar" ? "ar-EG" : "en-US",
          )}
        </span>
      ),
    },

    {
      accessorKey: "isVisible",
      id: "isVisible",
      size: 120,
      meta: {
        label: labels.visibility,
        exportValue: (row) =>
          (row as DemoRow).isVisible ? labels.visible : labels.hidden,
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.visibility} />
      ),
      cell: ({ row }) =>
        row.original.isVisible ? (
          <StatusBadge label={labels.visible} tone="success" icon={EyeIcon} />
        ) : (
          <StatusBadge label={labels.hidden} tone="neutral" icon={EyeOffIcon} />
        ),
    },

    {
      accessorKey: "isFeatured",
      id: "isFeatured",
      size: 110,
      meta: {
        label: labels.featured,
        align: "center",
        exportValue: (row) => ((row as DemoRow).isFeatured ? labels.yes : ""),
      },
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.featured} />
      ),
      cell: ({ row }) =>
        row.original.isFeatured ? (
          <CheckIcon className="mx-auto size-4 text-success" />
        ) : (
          <span className="block text-center text-muted-foreground">—</span>
        ),
    },

    createActionsColumn<DemoRow>(rowActions, labels.actions),
  ];
}
