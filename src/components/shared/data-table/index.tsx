"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { InboxIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";

import { BulkBar } from "./bulk-bar";
import { DataTableCards } from "./cards";
import { Pagination } from "./pagination";
import { SortableHeaderCell } from "./sortable-header-cell";
import { SortableRow } from "./sortable-row";
import { Toolbar } from "./toolbar";
import type { DataTableProps } from "./types";
import { useTablePreferences } from "./use-table-preferences";
import { useTableUrlState } from "./use-table-url-state";

/**
 * The single table for the entire application.
 *
 * Every dashboard module supplies column definitions and configuration; none of
 * them re-implement search, filtering, selection, export or pagination.
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  searchKeys = [],
  filters = [],
  bulkActions = [],
  exportFileName = "export",
  enableRowReorder = false,
  onRowReorder,
  storageKey,
  queryPrefix,
  isLoading = false,
  error = null,
  emptyTitle,
  emptyDescription,
}: DataTableProps<TData>) {
  const t = useTranslations("DataTable");
  const { preferences, update, reset, isHydrated } =
    useTablePreferences(storageKey);

  const filterKeys = useMemo(() => filters.map((f) => f.key), [filters]);
  const urlState = useTableUrlState(filterKeys, queryPrefix);

  const [rowSelection, setRowSelection] = useState({});
  const [, startReorder] = useTransition();
  const [orderedData, setOrderedData] = useState(data);

  // Server data is the source of truth; local order only bridges the optimistic
  // gap between dropping a row and the action resolving.
  useEffect(() => setOrderedData(data), [data]);

  const search = urlState.search;
  const sorting: SortingState = urlState.sorting;

  const columnFilters: ColumnFiltersState = useMemo(
    () =>
      filters
        .map((filter) => ({
          id: filter.key,
          value: urlState.getFilter(filter.key),
        }))
        .filter((entry) => entry.value.length > 0),
    [filters, urlState],
  );

  // ESLint reports "Compilation Skipped: Use of incompatible library" here.
  // That is expected and correct: TanStack Table returns fresh function
  // identities each render, so React Compiler opts this component out of
  // memoization rather than serving stale rows. Left as a warning on purpose.
  const table = useReactTable({
    data: orderedData,
    columns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter: search,
      rowSelection,
      columnVisibility: preferences.columnVisibility as VisibilityState,
      columnOrder: preferences.columnOrder,
      columnSizing: preferences.columnSizing,
      pagination: {
        pageIndex: Math.max(0, urlState.page - 1),
        pageSize: urlState.size,
      },
    },
    // TanStack resets to page 1 whenever filters change, which would discard the
    // page from a shared URL on first render. Search and filter changes reset the
    // page explicitly in `useTableUrlState` instead.
    autoResetPageIndex: false,
    enableRowSelection: true,
    enableMultiSort: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      urlState.setSorting(next);
    },
    onGlobalFilterChange: (value: string) => urlState.setSearch(value),
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(preferences.columnVisibility as VisibilityState)
          : updater;
      update({ columnVisibility: next });
    },
    onColumnSizingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(preferences.columnSizing)
          : updater;
      update({ columnSizing: next });
    },
    onPaginationChange: (updater) => {
      const current = {
        pageIndex: Math.max(0, urlState.page - 1),
        pageSize: urlState.size,
      };
      const next = typeof updater === "function" ? updater(current) : updater;
      urlState.setPagination(next.pageIndex + 1, next.pageSize);
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) return true;
      const needle = filterValue.toLowerCase();
      const keys = searchKeys.length > 0 ? searchKeys : [];
      return keys.some((key) =>
        String(row.getValue(key) ?? "")
          .toLowerCase()
          .includes(needle),
      );
    },
    filterFns: {},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = table.getVisibleLeafColumns().map((column) => column.id);
  const reorderableColumnIds = table
    .getVisibleLeafColumns()
    .filter(
      (column) => !column.columnDef.meta?.pinned && column.id !== "select",
    )
    .map((column) => column.id);

  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentOrder =
        preferences.columnOrder.length > 0
          ? preferences.columnOrder
          : columnIds;
      const from = currentOrder.indexOf(String(active.id));
      const to = currentOrder.indexOf(String(over.id));
      if (from === -1 || to === -1) return;

      update({ columnOrder: arrayMove(currentOrder, from, to) });
    },
    [columnIds, preferences.columnOrder, update],
  );

  const pageRowIds = table.getRowModel().rows.map((row) => row.id);

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const from = pageRowIds.indexOf(String(active.id));
      const to = pageRowIds.indexOf(String(over.id));
      if (from === -1 || to === -1) return;

      const nextIds = arrayMove(pageRowIds, from, to);
      const byId = new Map(orderedData.map((row) => [getRowId(row), row]));
      const reordered = nextIds
        .map((id) => byId.get(id))
        .filter((row): row is TData => row !== undefined);

      const untouched = orderedData.filter(
        (row) => !nextIds.includes(getRowId(row)),
      );
      setOrderedData([...reordered, ...untouched]);

      startReorder(async () => {
        await onRowReorder?.(nextIds);
      });
    },
    [getRowId, onRowReorder, orderedData, pageRowIds],
  );

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const rows = table.getRowModel().rows;
  const hasSelection = columns.some((column) => column.id === "select");

  if (error) {
    return (
      <EmptyState
        icon={TriangleAlertIcon}
        variant="error"
        title={t("errorTitle")}
        description={error}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Toolbar
        table={table}
        search={search}
        onSearchChange={urlState.setSearch}
        filters={filters}
        filterValues={Object.fromEntries(
          filters.map((filter) => [filter.key, urlState.getFilter(filter.key)]),
        )}
        onFilterChange={urlState.setFilter}
        density={preferences.density}
        onDensityChange={(density) => update({ density })}
        onResetPreferences={reset}
        exportFileName={exportFileName}
        searchable={searchKeys.length > 0}
      />

      {isLoading || !isHydrated ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={emptyTitle ?? t("emptyTitle")}
          description={emptyDescription ?? t("emptyDescription")}
        />
      ) : (
        <>
          {/* Desktop: the full table. */}
          <div className="hidden rounded-lg border md:block">
            <div className="relative overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={handleColumnDragEnd}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleRowDragEnd}
                >
                  {/* Fill the container; column sizes are the minimum, and only
                      scroll once they no longer fit. */}
                  <Table style={{ minWidth: table.getTotalSize() }}>
                    <TableHeader className="sticky top-0 z-10 bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {enableRowReorder ? (
                            <th className="w-8" aria-hidden />
                          ) : null}
                          <SortableContext
                            items={reorderableColumnIds}
                            strategy={horizontalListSortingStrategy}
                          >
                            {headerGroup.headers.map((header) => (
                              <SortableHeaderCell
                                key={header.id}
                                header={header}
                                canReorder={reorderableColumnIds.includes(
                                  header.column.id,
                                )}
                              />
                            ))}
                          </SortableContext>
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      <SortableContext
                        items={pageRowIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {rows.map((row) => (
                          <SortableRow
                            key={row.id}
                            row={row}
                            rowId={row.id}
                            enableReorder={enableRowReorder}
                            density={preferences.density}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              </DndContext>
            </div>
          </div>

          {/* Mobile: the same columns, rendered as cards. */}
          <DataTableCards table={table} hasSelection={hasSelection} />
        </>
      )}

      <Pagination table={table} />

      <BulkBar
        selectedRows={selectedRows}
        actions={bulkActions}
        onClear={() => setRowSelection({})}
      />
    </div>
  );
}

export { createSelectionColumn, createActionsColumn } from "./columns";
export type * from "./types";
