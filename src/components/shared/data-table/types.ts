import type { ColumnDef, Row, RowData, Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

/** One option in a faceted filter dropdown. */
export type FilterOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

export type FilterConfig = {
  /** Column id this filter targets. */
  key: string;
  label: string;
  options: FilterOption[];
};

/** An action applied to every selected row at once. */
export type BulkAction<TData> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  /** Shows a confirm dialog before running. */
  confirm?: boolean;
  run: (rows: TData[]) => Promise<void> | void;
};

/** An action in a single row's `⋯` menu. */
export type RowAction<TData> = {
  id: string;
  label: string | ((row: TData) => string);
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  confirm?: boolean;
  /** Hide the action for rows it does not apply to. */
  hidden?: (row: TData) => boolean;
  run: (row: TData) => Promise<void> | void;
};

export type TableDensity = "comfortable" | "compact";

export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

export type ExportScope = "page" | "all";

/**
 * Column metadata the table reads through `column.columnDef.meta`. Declaring it
 * once here is what lets a module supply nothing but column definitions.
 */
declare module "@tanstack/react-table" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human label used by the column-visibility menu and every export. */
    label?: string;
    /** Excluded from exports (selection checkbox, actions column). */
    excludeFromExport?: boolean;
    /** Pinned to the inline-end edge and never reordered. */
    pinned?: boolean;
    /** Plain value for exports, when the cell renders JSX. */
    exportValue?: (row: unknown) => string | number | boolean | null;
    /** Rendered as the card title on mobile. */
    cardTitle?: boolean;
    align?: "start" | "end" | "center";
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Stable row identity — required for selection and reordering. */
  getRowId: (row: TData) => string;

  searchKeys?: string[];
  filters?: FilterConfig[];
  bulkActions?: BulkAction<TData>[];
  rowActions?: RowAction<TData>[];

  exportFileName?: string;
  /** Shows a drag handle and reports the new order. */
  enableRowReorder?: boolean;
  onRowReorder?: (orderedIds: string[]) => Promise<void> | void;

  /** Persists column order, visibility, sizing and density in localStorage. */
  storageKey: string;

  /**
   * Prefixes the query-string keys. Needed only when several tables share one
   * page, so their search, sort and page do not overwrite each other.
   */
  queryPrefix?: string;

  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
};

export type DataTableContextValue<TData> = {
  table: Table<TData>;
  density: TableDensity;
};

export type RowType<TData> = Row<TData>;
