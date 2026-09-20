"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { FormStep } from "@/components/shared/form-stepper";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  dateColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  DateRangeField,
  ImageField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppLocale } from "@/i18n/routing";
import {
  experienceSchema,
  type ExperienceInput,
} from "@/lib/validations/content";
import type { ExperienceRow } from "@/server/queries/dashboard";

const EMPTY: ExperienceInput = {
  companyAr: "",
  companyEn: "",
  roleAr: "",
  roleEn: "",
  locationAr: null,
  locationEn: null,
  startDate: new Date(),
  endDate: null,
  isCurrent: false,
  descriptionAr: "",
  descriptionEn: "",
  logoUrl: null,
  companyUrl: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

export function ExperienceClient({ rows }: { rows: ExperienceRow[] }) {
  const t = useTranslations("Experience");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const columns = useMemo<ColumnDef<ExperienceRow, unknown>[]>(
    () => [
      bilingualColumn<ExperienceRow>({
        id: "role",
        label: tc("role"),
        ar: (row) => row.roleAr,
        en: (row) => row.roleEn,
        locale,
        size: 220,
        isCardTitle: true,
      }),
      bilingualColumn<ExperienceRow>({
        id: "company",
        label: tc("company"),
        ar: (row) => row.companyAr,
        en: (row) => row.companyEn,
        locale,
        size: 220,
      }),
      dateColumn<ExperienceRow>({
        id: "startDate",
        label: tc("startDate"),
        value: (row) => row.startDate,
        locale,
      }),
      dateColumn<ExperienceRow>({
        id: "endDate",
        label: tc("endDate"),
        value: (row) => row.endDate,
        locale,
        fallback: t("present"),
      }),
      {
        accessorKey: "isCurrent",
        id: "isCurrent",
        size: 110,
        meta: {
          label: t("current"),
          exportValue: (row) =>
            (row as ExperienceRow).isCurrent ? tc("yes") : "",
        },
        header: ({ column }) => (
          <ColumnHeader column={column} title={t("current")} />
        ),
        cell: ({ row }) =>
          row.original.isCurrent ? (
            <StatusBadge label={t("current")} tone="accent" />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      visibilityColumn<ExperienceRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  return (
    <CrudModule<ExperienceRow, ExperienceInput>
      entity="experience"
      rows={rows}
      columns={columns}
      schema={experienceSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        companyAr: row.companyAr,
        companyEn: row.companyEn,
        roleAr: row.roleAr,
        roleEn: row.roleEn,
        locationAr: row.locationAr,
        locationEn: row.locationEn,
        startDate: row.startDate,
        endDate: row.endDate,
        isCurrent: row.isCurrent,
        descriptionAr: row.descriptionAr,
        descriptionEn: row.descriptionEn,
        logoUrl: row.logoUrl,
        companyUrl: row.companyUrl,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="experience"
      exportFileName="experience"
      searchKeys={["role", "company"]}
      enableRowReorder
      filters={[
        {
          key: "isVisible",
          label: tc("visibility"),
          options: [
            { value: "true", label: tc("visible") },
            { value: "false", label: tc("hidden") },
          ],
        },
      ]}
    >
      <FormStep id="basics">
        <TextField name="roleAr" label={t("fields.roleAr")} />
        <TextField name="roleEn" label={t("fields.roleEn")} dir="ltr" />
        <TextField name="companyAr" label={t("fields.companyAr")} />
        <TextField name="companyEn" label={t("fields.companyEn")} dir="ltr" />
        <TextField name="locationAr" label={t("fields.locationAr")} />
        <TextField name="locationEn" label={t("fields.locationEn")} dir="ltr" />
      </FormStep>
      <FormStep id="details">
        <DateRangeField
          name="startDate"
          endName="endDate"
          label={tc("period")}
        />
        <SwitchField name="isCurrent" label={t("fields.isCurrent")} />
      </FormStep>
      <FormStep id="content">
        <TextField
          name="descriptionAr"
          label={t("fields.descriptionAr")}
          multiline
        />
        <TextField
          name="descriptionEn"
          label={t("fields.descriptionEn")}
          multiline
        />
        <ImageField name="logoUrl" label={t("fields.logo")} />
        <TextField
          name="companyUrl"
          label={t("fields.companyUrl")}
          type="url"
          dir="ltr"
        />
      </FormStep>
      <FormStep id="publishing">
        <TextField name="order" label={tc("order")} type="number" dir="ltr" />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
      </FormStep>
    </CrudModule>
  );
}
