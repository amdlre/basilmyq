"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";

import { ColumnHeader } from "./column-header";

/**
 * The columns every content model shares. Defined once so a module's
 * `columns.tsx` only describes what is actually specific to it.
 */

export type CommonLabels = {
  visibility: string;
  visible: string;
  hidden: string;
  featured: string;
  yes: string;
};

export function visibilityColumn<TRow extends { isVisible: boolean }>(
  labels: CommonLabels,
): ColumnDef<TRow, unknown> {
  return {
    accessorKey: "isVisible",
    id: "isVisible",
    size: 120,
    meta: {
      label: labels.visibility,
      exportValue: (row) =>
        (row as TRow).isVisible ? labels.visible : labels.hidden,
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
  };
}

export function featuredColumn<TRow extends { isFeatured: boolean }>(
  labels: CommonLabels,
): ColumnDef<TRow, unknown> {
  return {
    accessorKey: "isFeatured",
    id: "isFeatured",
    size: 100,
    meta: {
      label: labels.featured,
      align: "center",
      exportValue: (row) => ((row as TRow).isFeatured ? labels.yes : ""),
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
  };
}

/** A bilingual text column that follows the dashboard's own language. */
export function bilingualColumn<TRow>(options: {
  id: string;
  label: string;
  ar: (row: TRow) => string;
  en: (row: TRow) => string;
  locale: "ar" | "en";
  size?: number;
  isCardTitle?: boolean;
}): ColumnDef<TRow, unknown> {
  const read = options.locale === "ar" ? options.ar : options.en;

  return {
    id: options.id,
    accessorFn: (row) => read(row),
    size: options.size ?? 220,
    meta: { label: options.label, cardTitle: options.isCardTitle },
    header: ({ column }) => (
      <ColumnHeader column={column} title={options.label} />
    ),
    cell: ({ row }) => (
      <span className="truncate font-medium">{read(row.original)}</span>
    ),
  };
}

export function dateColumn<TRow>(options: {
  id: string;
  label: string;
  value: (row: TRow) => Date | null;
  locale: "ar" | "en";
  fallback?: string;
}): ColumnDef<TRow, unknown> {
  const format = (date: Date | null): string =>
    date
      ? new Intl.DateTimeFormat(options.locale === "ar" ? "ar-SA" : "en-GB", {
          year: "numeric",
          month: "short",
        }).format(date)
      : (options.fallback ?? "—");

  return {
    id: options.id,
    accessorFn: (row) => options.value(row)?.getTime() ?? 0,
    size: 130,
    meta: {
      label: options.label,
      exportValue: (row) => format(options.value(row as TRow)),
    },
    header: ({ column }) => (
      <ColumnHeader column={column} title={options.label} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {format(options.value(row.original))}
      </span>
    ),
  };
}
