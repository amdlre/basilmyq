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
  SelectField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppLocale } from "@/i18n/routing";
import {
  educationSchema,
  type EducationInput,
} from "@/lib/validations/content";
import type { EducationRow } from "@/server/queries/dashboard";

const TYPES = ["DEGREE", "CERTIFICATE"] as const;

const EMPTY: EducationInput = {
  type: "DEGREE",
  schoolAr: "",
  schoolEn: "",
  degreeAr: "",
  degreeEn: "",
  fieldAr: null,
  fieldEn: null,
  startDate: new Date(),
  endDate: null,
  credentialUrl: null,
  logoUrl: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

export function EducationClient({ rows }: { rows: EducationRow[] }) {
  const t = useTranslations("Education");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const typeLabels = {
    DEGREE: t("type.DEGREE"),
    CERTIFICATE: t("type.CERTIFICATE"),
  };
  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const columns = useMemo<ColumnDef<EducationRow, unknown>[]>(
    () => [
      bilingualColumn<EducationRow>({
        id: "degree",
        label: tc("degree"),
        ar: (row) => row.degreeAr,
        en: (row) => row.degreeEn,
        locale,
        size: 240,
        isCardTitle: true,
      }),
      bilingualColumn<EducationRow>({
        id: "school",
        label: tc("school"),
        ar: (row) => row.schoolAr,
        en: (row) => row.schoolEn,
        locale,
        size: 220,
      }),
      {
        accessorKey: "type",
        id: "type",
        size: 130,
        meta: {
          label: tc("type"),
          exportValue: (row) => typeLabels[(row as EducationRow).type],
        },
        filterFn: (row, id, value: string[]) =>
          value.includes(String(row.getValue(id))),
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("type")} />
        ),
        cell: ({ row }) => (
          <StatusBadge
            label={typeLabels[row.original.type]}
            tone={row.original.type === "DEGREE" ? "accent" : "neutral"}
          />
        ),
      },
      dateColumn<EducationRow>({
        id: "endDate",
        label: tc("endDate"),
        value: (row) => row.endDate,
        locale,
      }),
      visibilityColumn<EducationRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  return (
    <CrudModule<EducationRow, EducationInput>
      entity="education"
      rows={rows}
      columns={columns}
      schema={educationSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        type: row.type,
        schoolAr: row.schoolAr,
        schoolEn: row.schoolEn,
        degreeAr: row.degreeAr,
        degreeEn: row.degreeEn,
        fieldAr: row.fieldAr,
        fieldEn: row.fieldEn,
        startDate: row.startDate,
        endDate: row.endDate,
        credentialUrl: row.credentialUrl,
        logoUrl: row.logoUrl,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="education"
      exportFileName="education"
      searchKeys={["degree", "school"]}
      enableRowReorder
      filters={[
        {
          key: "type",
          label: tc("type"),
          options: TYPES.map((value) => ({ value, label: typeLabels[value] })),
        },
      ]}
    >
      <FormStep id="basics">
        <SelectField
          name="type"
          label={t("fields.type")}
          options={TYPES.map((value) => ({ value, label: typeLabels[value] }))}
        />
        <TextField name="degreeAr" label={t("fields.degreeAr")} />
        <TextField name="degreeEn" label={t("fields.degreeEn")} dir="ltr" />
        <TextField name="schoolAr" label={t("fields.schoolAr")} />
        <TextField name="schoolEn" label={t("fields.schoolEn")} dir="ltr" />
        <TextField name="fieldAr" label={t("fields.fieldAr")} />
        <TextField name="fieldEn" label={t("fields.fieldEn")} dir="ltr" />
      </FormStep>
      <FormStep id="details">
        <DateRangeField
          name="startDate"
          endName="endDate"
          label={tc("period")}
        />
        <TextField
          name="credentialUrl"
          label={t("fields.credentialUrl")}
          type="url"
          dir="ltr"
        />
        <ImageField name="logoUrl" label={t("fields.logo")} />
      </FormStep>
      <FormStep id="publishing">
        <TextField name="order" label={tc("order")} type="number" dir="ltr" />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
      </FormStep>
    </CrudModule>
  );
}
