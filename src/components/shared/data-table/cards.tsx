"use client";

import type { Row, Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

type CardsProps<TData> = {
  table: Table<TData>;
  hasSelection: boolean;
};

function cardTitleCell<TData>(row: Row<TData>) {
  return (
    row
      .getVisibleCells()
      .find((cell) => cell.column.columnDef.meta?.cardTitle) ??
    row.getVisibleCells().find((cell) => !cell.column.columnDef.meta?.pinned)
  );
}

/**
 * The mobile rendering of the same table. It reuses the identical column
 * definitions, so a module never describes its data twice.
 */
export function DataTableCards<TData>({
  table,
  hasSelection,
}: CardsProps<TData>) {
  const t = useTranslations("DataTable");

  return (
    <div className="space-y-3 md:hidden">
      {table.getRowModel().rows.map((row) => {
        const titleCell = cardTitleCell(row);
        const actionsCell = row
          .getVisibleCells()
          .find((cell) => cell.column.columnDef.meta?.pinned);

        const detailCells = row
          .getVisibleCells()
          .filter(
            (cell) =>
              cell.id !== titleCell?.id &&
              cell.id !== actionsCell?.id &&
              cell.column.id !== "select" &&
              !cell.column.columnDef.meta?.excludeFromExport,
          );

        return (
          <Card
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {hasSelection ? (
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) =>
                        row.toggleSelected(Boolean(value))
                      }
                      aria-label={t("selectRow")}
                      className="mt-0.5"
                    />
                  ) : null}
                  <div className="min-w-0 font-medium">
                    {titleCell
                      ? flexRender(
                          titleCell.column.columnDef.cell,
                          titleCell.getContext(),
                        )
                      : null}
                  </div>
                </div>
                {actionsCell
                  ? flexRender(
                      actionsCell.column.columnDef.cell,
                      actionsCell.getContext(),
                    )
                  : null}
              </div>

              <dl className="grid gap-1.5 text-sm">
                {detailCells.map((cell) => (
                  <div
                    key={cell.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="shrink-0 text-muted-foreground">
                      {cell.column.columnDef.meta?.label ?? cell.column.id}
                    </dt>
                    <dd className="min-w-0 text-end">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
