"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  featuredColumn,
  visibilityColumn,
  type CommonLabels,
} from "@/components/shared/data-table/common-columns";
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import type { AppLocale } from "@/i18n/routing";
import type { ProjectRow } from "@/server/queries/dashboard";

const STATUS_TONES: Record<ProjectRow["status"], StatusTone> = {
  COMPLETED: "success",
  IN_PROGRESS: "accent",
  DRAFT: "warning",
  ARCHIVED: "neutral",
};

export function projectColumns(options: {
  locale: AppLocale;
  common: CommonLabels;
  labels: {
    title: string;
    status: string;
    category: string;
    year: string;
    uncategorised: string;
    statusLabels: Record<ProjectRow["status"], string>;
  };
}): ColumnDef<ProjectRow, unknown>[] {
  const { locale, labels, common } = options;

  return [
    bilingualColumn<ProjectRow>({
      id: "title",
      label: labels.title,
      ar: (row) => row.titleAr,
      en: (row) => row.titleEn,
      locale,
      size: 260,
      isCardTitle: true,
    }),
    {
      accessorKey: "status",
      id: "status",
      size: 130,
      meta: {
        label: labels.status,
        exportValue: (row) =>
          labels.statusLabels[(row as ProjectRow).status] ?? "",
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.status} />
      ),
      cell: ({ row }) => (
        <StatusBadge
          label={labels.statusLabels[row.original.status]}
          tone={STATUS_TONES[row.original.status]}
        />
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.categoryId ?? "",
      size: 150,
      meta: {
        label: labels.category,
        exportValue: (row) => {
          const category = (row as ProjectRow).category;
          if (!category) return labels.uncategorised;
          return locale === "ar" ? category.nameAr : category.nameEn;
        },
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      header: ({ column }) => (
        <ColumnHeader column={column} title={labels.category} />
      ),
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <span className="text-muted-foreground">
            {category
              ? locale === "ar"
                ? category.nameAr
                : category.nameEn
              : labels.uncategorised}
          </span>
        );
      },
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
        <span className="tabular-nums">{row.original.year ?? "—"}</span>
      ),
    },
    visibilityColumn<ProjectRow>(common),
    featuredColumn<ProjectRow>(common),
  ];
}
