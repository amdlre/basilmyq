"use client";

import { type ReactNode, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { DataTable } from "@/components/shared/data-table";
import {
  createActionsColumn,
  createSelectionColumn,
} from "@/components/shared/data-table/columns";
import type {
  BulkAction,
  FilterConfig,
  RowAction,
} from "@/components/shared/data-table/types";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteContent,
  duplicateContent,
  reorderContent,
  setContentFlag,
  upsertContent,
} from "@/server/actions/content";

/** The minimum a row must expose for the shared actions to work. */
export type CrudRow = {
  id: string;
  isVisible?: boolean;
  isFeatured?: boolean;
};

type CrudModuleProps<TRow extends CrudRow, TValues extends FieldValues> = {
  entity: string;
  rows: TRow[];
  /** Columns without the actions column — that is appended here. */
  columns: ColumnDef<TRow, unknown>[];
  schema: ZodType<TValues, TValues>;
  emptyValues: DefaultValues<TValues>;
  /** Maps an existing row onto form values when editing. */
  toFormValues: (row: TRow) => DefaultValues<TValues>;
  children: ReactNode;

  singularLabel: string;
  storageKey: string;
  /** See `DataTable`'s `queryPrefix`: set when several modules share a page. */
  queryPrefix?: string;
  exportFileName: string;
  searchKeys?: string[];
  filters?: FilterConfig[];
  enableRowReorder?: boolean;
  /** Extra row actions appended before delete, e.g. "view on site". */
  extraRowActions?: RowAction<TRow>[];
};

/**
 * One component, every CRUD module.
 *
 * It owns the create/edit dialog, the row and bulk actions, and the toasts, so a
 * module page supplies only its columns, its schema and its fields. If a module
 * ever needs UI code of its own, the gap belongs here or in `shared/`.
 */
export function CrudModule<TRow extends CrudRow, TValues extends FieldValues>({
  entity,
  rows,
  columns,
  schema,
  emptyValues,
  toFormValues,
  children,
  singularLabel,
  storageKey,
  queryPrefix,
  exportFileName,
  searchKeys = [],
  filters = [],
  enableRowReorder = false,
  extraRowActions = [],
}: CrudModuleProps<TRow, TValues>) {
  const t = useTranslations("Crud");
  const tCommon = useTranslations("Common");
  const tTable = useTranslations("DataTable");
  const [editing, setEditing] = useState<TRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const report = (
    result: { ok: boolean; message?: string },
    success: string,
  ) => {
    if (result.ok) {
      toast.success(success);
      return;
    }
    toast.error(
      result.message === "DUPLICATE"
        ? t("duplicateKey")
        : (result.message ?? tCommon("somethingWentWrong")),
    );
  };

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const rowActions: RowAction<TRow>[] = [
    {
      id: "edit",
      label: tCommon("edit"),
      icon: PencilIcon,
      run: (row) => {
        setEditing(row);
        setIsOpen(true);
      },
    },
    {
      id: "duplicate",
      label: t("duplicate"),
      icon: CopyIcon,
      run: async (row) =>
        report(await duplicateContent(entity, row.id), t("duplicated")),
    },
    {
      id: "visibility",
      // A switch names the setting, not the command: the state is in the
      // switch, so "Hide"/"Show" would fight it.
      label: t("visible"),
      icon: EyeIcon,
      hidden: (row) => row.isVisible === undefined,
      toggle: (row) => row.isVisible === true,
      run: async (row) =>
        report(
          await setContentFlag(entity, [row.id], "isVisible", !row.isVisible),
          t("updated"),
        ),
    },
    ...extraRowActions,
    {
      id: "delete",
      label: tCommon("delete"),
      icon: Trash2Icon,
      variant: "destructive",
      confirm: true,
      run: async (row) =>
        report(await deleteContent(entity, [row.id]), tCommon("deleted")),
    },
  ];

  const bulkActions: BulkAction<TRow>[] = [
    {
      id: "show",
      label: t("show"),
      icon: EyeIcon,
      run: async (selected) =>
        report(
          await setContentFlag(
            entity,
            selected.map((row) => row.id),
            "isVisible",
            true,
          ),
          t("updated"),
        ),
    },
    {
      id: "hide",
      label: t("hide"),
      icon: EyeOffIcon,
      run: async (selected) =>
        report(
          await setContentFlag(
            entity,
            selected.map((row) => row.id),
            "isVisible",
            false,
          ),
          t("updated"),
        ),
    },
    {
      id: "feature",
      label: t("feature"),
      icon: StarIcon,
      run: async (selected) =>
        report(
          await setContentFlag(
            entity,
            selected.map((row) => row.id),
            "isFeatured",
            true,
          ),
          t("updated"),
        ),
    },
    {
      id: "delete",
      label: tCommon("delete"),
      icon: Trash2Icon,
      variant: "destructive",
      confirm: true,
      run: async (selected) =>
        report(
          await deleteContent(
            entity,
            selected.map((row) => row.id),
          ),
          tCommon("deleted"),
        ),
    },
  ];

  // Selection first, actions last — every module gets both without asking.
  const allColumns = useMemo(
    () => [
      createSelectionColumn<TRow>({
        selectAll: tTable("selectAll"),
        selectRow: tTable("selectRow"),
      }),
      ...columns,
      createActionsColumn<TRow>(rowActions, tCommon("actions")),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, tCommon, tTable],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <PlusIcon />
          {t("createNamed", { name: singularLabel })}
        </Button>
      </div>

      <DataTable
        columns={allColumns}
        data={rows}
        getRowId={(row) => row.id}
        searchKeys={searchKeys}
        filters={filters}
        bulkActions={bulkActions}
        exportFileName={exportFileName}
        storageKey={storageKey}
        queryPrefix={queryPrefix}
        enableRowReorder={enableRowReorder}
        onRowReorder={async (orderedIds) =>
          report(await reorderContent(entity, orderedIds), t("reordered"))
        }
      />

      <FormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={
          editing
            ? t("editNamed", { name: singularLabel })
            : t("createNamed", { name: singularLabel })
        }
        schema={schema}
        defaultValues={editing ? toFormValues(editing) : emptyValues}
        action={async (values) =>
          upsertContent(entity, editing?.id ?? null, values)
        }
      >
        {children}
      </FormDialog>
    </div>
  );
}
