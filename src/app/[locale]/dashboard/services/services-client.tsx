"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  featuredColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  SwitchField,
  TagsField,
  TextField,
} from "@/components/shared/form-fields";
import type { AppLocale } from "@/i18n/routing";
import { serviceSchema, type ServiceInput } from "@/lib/validations/content";
import type { ServiceRow } from "@/server/queries/dashboard";

const EMPTY: ServiceInput = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  icon: null,
  featuresAr: [],
  featuresEn: [],
  price: null,
  priceNote: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

export function ServicesClient({ rows }: { rows: ServiceRow[] }) {
  const t = useTranslations("Services");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const columns = useMemo<ColumnDef<ServiceRow, unknown>[]>(
    () => [
      bilingualColumn<ServiceRow>({
        id: "title",
        label: tc("name"),
        ar: (row) => row.titleAr,
        en: (row) => row.titleEn,
        locale,
        size: 260,
        isCardTitle: true,
      }),
      {
        accessorKey: "price",
        id: "price",
        size: 140,
        meta: { label: tc("price") },
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("price")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.price ?? "—"}
          </span>
        ),
      },
      visibilityColumn<ServiceRow>(common),
      featuredColumn<ServiceRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, tc],
  );

  return (
    <CrudModule<ServiceRow, ServiceInput>
      entity="service"
      rows={rows}
      columns={columns}
      schema={serviceSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        titleAr: row.titleAr,
        titleEn: row.titleEn,
        descriptionAr: row.descriptionAr,
        descriptionEn: row.descriptionEn,
        icon: row.icon,
        featuresAr: row.featuresAr,
        featuresEn: row.featuresEn,
        price: row.price,
        priceNote: row.priceNote,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="services"
      exportFileName="services"
      searchKeys={["title"]}
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
      <TextField name="titleAr" label={t("fields.titleAr")} />
      <TextField name="titleEn" label={t("fields.titleEn")} dir="ltr" />
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
      <TextField name="icon" label={t("fields.icon")} dir="ltr" />
      <TagsField name="featuresAr" label={t("fields.featuresAr")} />
      <TagsField name="featuresEn" label={t("fields.featuresEn")} />
      <TextField name="price" label={t("fields.price")} />
      <TextField name="priceNote" label={t("fields.priceNote")} />
      <TextField name="order" label={tc("order")} type="number" dir="ltr" />
      <SwitchField name="isVisible" label={tc("visibleOnSite")} />
      <SwitchField name="isFeatured" label={tc("featured")} />
    </CrudModule>
  );
}
