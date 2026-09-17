"use client";

import { useMemo, useState } from "react";
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/shared/data-table";
import type {
  BulkAction,
  FilterConfig,
  RowAction,
} from "@/components/shared/data-table/types";
import {
  ImageField,
  RichTextField,
  SelectField,
  SlugField,
  SwitchField,
  TagsField,
  TextField,
} from "@/components/shared/form-fields";
import { FormSheet } from "@/components/shared/form-sheet";
import { StatsGrid } from "@/components/shared/stats-grid";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";

import { buildDemoColumns } from "./columns";
import { DEMO_ROWS, type DemoRow } from "./demo-data";

/** Demo schema — the same object would be shared with a Server Action. */
const demoSchema = z.object({
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  slug: z.string().min(2),
  summaryAr: z.string().min(10),
  contentAr: z.string().min(10),
  category: z.string().min(1),
  tags: z.array(z.string()),
  cover: z.string().nullable(),
  isVisible: z.boolean(),
});

type DemoValues = z.infer<typeof demoSchema>;

const DEFAULT_VALUES: DemoValues = {
  titleAr: "",
  titleEn: "",
  slug: "",
  summaryAr: "",
  contentAr: "",
  category: "web-apps",
  tags: [],
  cover: null,
  isVisible: true,
};

export function PlaygroundClient() {
  const t = useTranslations("Playground");
  const tTable = useTranslations("DataTable");
  const locale = useLocale() as AppLocale;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const statusLabels: Record<DemoRow["status"], string> = {
    DRAFT: t("status.DRAFT"),
    IN_PROGRESS: t("status.IN_PROGRESS"),
    COMPLETED: t("status.COMPLETED"),
    ARCHIVED: t("status.ARCHIVED"),
  };

  const categoryLabels: Record<string, string> = {
    "web-apps": t("category.web-apps"),
    ecommerce: t("category.ecommerce"),
    dashboards: t("category.dashboards"),
    "design-systems": t("category.design-systems"),
  };

  const demoAction = (label: string) => {
    toast.success(label, { description: t("demoToast") });
  };

  const rowActions: RowAction<DemoRow>[] = [
    {
      id: "edit",
      label: t("actions.edit"),
      icon: PencilIcon,
      run: () => setIsFormOpen(true),
    },
    {
      id: "duplicate",
      label: t("actions.duplicate"),
      icon: CopyIcon,
      run: () => demoAction(t("actions.duplicate")),
    },
    {
      id: "visibility",
      label: (row) =>
        row.isVisible
          ? t("actions.toggleVisibility")
          : t("actions.toggleVisibility"),
      icon: EyeIcon,
      run: () => demoAction(t("actions.toggleVisibility")),
    },
    {
      id: "view",
      label: t("actions.viewOnSite"),
      icon: ExternalLinkIcon,
      hidden: (row) => !row.isVisible,
      run: () => demoAction(t("actions.viewOnSite")),
    },
    {
      id: "delete",
      label: t("actions.delete"),
      icon: Trash2Icon,
      variant: "destructive",
      confirm: true,
      run: () => demoAction(t("actions.delete")),
    },
  ];

  const bulkActions: BulkAction<DemoRow>[] = [
    {
      id: "feature",
      label: t("bulk.feature"),
      icon: StarIcon,
      run: (rows) => demoAction(`${t("bulk.feature")} (${rows.length})`),
    },
    {
      id: "hide",
      label: t("bulk.hide"),
      icon: EyeOffIcon,
      run: (rows) => demoAction(`${t("bulk.hide")} (${rows.length})`),
    },
    {
      id: "delete",
      label: t("bulk.delete"),
      icon: Trash2Icon,
      variant: "destructive",
      confirm: true,
      run: (rows) => demoAction(`${t("bulk.delete")} (${rows.length})`),
    },
  ];

  const columns = useMemo(
    () =>
      buildDemoColumns({
        locale,
        rowActions,
        labels: {
          selectAll: tTable("selectAll"),
          selectRow: tTable("selectRow"),
          actions: tTable("rowActions"),
          title: t("columns.title"),
          status: t("columns.status"),
          category: t("columns.category"),
          tags: t("columns.tags"),
          year: t("columns.year"),
          views: t("columns.views"),
          visibility: t("columns.visibility"),
          featured: t("columns.featured"),
          visible: t("visible"),
          hidden: t("hidden"),
          yes: t("yes"),
          statusLabels,
          categoryLabels,
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tTable],
  );

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: t("columns.status"),
      options: (["COMPLETED", "IN_PROGRESS", "DRAFT", "ARCHIVED"] as const).map(
        (value) => ({ value, label: statusLabels[value] }),
      ),
    },
    {
      key: "category",
      label: t("columns.category"),
      options: Object.entries(categoryLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "isVisible",
      label: t("columns.visibility"),
      options: [
        { value: "true", label: t("visible") },
        { value: "false", label: t("hidden") },
      ],
    },
  ];

  const stats = [
    { label: t("stats.total"), value: DEMO_ROWS.length, icon: PlusIcon },
    {
      label: t("stats.published"),
      value: DEMO_ROWS.filter((row) => row.isVisible).length,
      icon: EyeIcon,
      variant: "success" as const,
      trend: 12,
    },
    {
      label: t("stats.hidden"),
      value: DEMO_ROWS.filter((row) => !row.isVisible).length,
      icon: EyeOffIcon,
      variant: "warning" as const,
    },
    {
      label: t("stats.featured"),
      value: DEMO_ROWS.filter((row) => row.isFeatured).length,
      icon: StarIcon,
      variant: "accent" as const,
      trend: -4,
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <DataTable
        columns={columns}
        data={DEMO_ROWS}
        getRowId={(row) => row.id}
        searchKeys={["title"]}
        filters={filters}
        bulkActions={bulkActions}
        exportFileName="playground"
        enableRowReorder
        onRowReorder={() => {
          toast.success(t("reordered"));
        }}
        storageKey="playground"
      />

      <Button className="hidden" onClick={() => setIsFormOpen(true)}>
        <PlusIcon />
      </Button>

      <FormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={t("formTitle")}
        description={t("formDescription")}
        schema={demoSchema}
        defaultValues={DEFAULT_VALUES}
        action={async (values) => {
          // A real module would call a Server Action here.
          await new Promise((resolve) => setTimeout(resolve, 400));
          return { ok: true, message: `${values.titleEn || values.titleAr} ✓` };
        }}
      >
        <TextField name="titleAr" label={t("fields.titleAr")} />
        <TextField name="titleEn" label={t("fields.titleEn")} dir="ltr" />
        <SlugField name="slug" source="titleEn" label={t("fields.slug")} />
        <TextField name="summaryAr" label={t("fields.summary")} multiline />
        <RichTextField name="contentAr" label={t("fields.content")} rows={8} />
        <SelectField
          name="category"
          label={t("fields.category")}
          options={Object.entries(categoryLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <TagsField name="tags" label={t("fields.tags")} />
        <ImageField name="cover" label={t("fields.cover")} />
        <SwitchField name="isVisible" label={t("fields.isVisible")} />
      </FormSheet>
    </div>
  );
}
