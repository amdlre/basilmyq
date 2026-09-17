"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { StarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  featuredColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  ImageField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validations/content";
import type { TestimonialRow } from "@/server/queries/dashboard";

const EMPTY: TestimonialInput = {
  nameAr: "",
  nameEn: "",
  roleAr: null,
  roleEn: null,
  companyAr: null,
  companyEn: null,
  avatarUrl: null,
  quoteAr: "",
  quoteEn: "",
  rating: 5,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

export function TestimonialsClient({ rows }: { rows: TestimonialRow[] }) {
  const t = useTranslations("Testimonials");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const columns = useMemo<ColumnDef<TestimonialRow, unknown>[]>(
    () => [
      bilingualColumn<TestimonialRow>({
        id: "name",
        label: tc("name"),
        ar: (row) => row.nameAr,
        en: (row) => row.nameEn,
        locale,
        size: 220,
        isCardTitle: true,
      }),
      bilingualColumn<TestimonialRow>({
        id: "company",
        label: tc("company"),
        ar: (row) => row.companyAr ?? "—",
        en: (row) => row.companyEn ?? "—",
        locale,
        size: 200,
      }),
      {
        accessorKey: "rating",
        id: "rating",
        size: 140,
        meta: {
          label: tc("rating"),
          exportValue: (row) => (row as TestimonialRow).rating,
        },
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("rating")} />
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center gap-0.5"
            aria-label={String(row.original.rating)}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon
                key={index}
                className={cn(
                  "size-3.5",
                  index < row.original.rating
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
        ),
      },
      visibilityColumn<TestimonialRow>(common),
      featuredColumn<TestimonialRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, tc],
  );

  return (
    <CrudModule<TestimonialRow, TestimonialInput>
      entity="testimonial"
      rows={rows}
      columns={columns}
      schema={testimonialSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        roleAr: row.roleAr,
        roleEn: row.roleEn,
        companyAr: row.companyAr,
        companyEn: row.companyEn,
        avatarUrl: row.avatarUrl,
        quoteAr: row.quoteAr,
        quoteEn: row.quoteEn,
        rating: row.rating,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="testimonials"
      exportFileName="testimonials"
      searchKeys={["name"]}
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
      <TextField name="nameAr" label={t("fields.nameAr")} />
      <TextField name="nameEn" label={t("fields.nameEn")} dir="ltr" />
      <TextField name="roleAr" label={t("fields.roleAr")} />
      <TextField name="roleEn" label={t("fields.roleEn")} dir="ltr" />
      <TextField name="companyAr" label={t("fields.companyAr")} />
      <TextField name="companyEn" label={t("fields.companyEn")} dir="ltr" />
      <ImageField name="avatarUrl" label={t("fields.avatar")} />
      <TextField name="quoteAr" label={t("fields.quoteAr")} multiline />
      <TextField name="quoteEn" label={t("fields.quoteEn")} multiline />
      <TextField
        name="rating"
        label={t("fields.rating")}
        type="number"
        dir="ltr"
      />
      <TextField name="order" label={tc("order")} type="number" dir="ltr" />
      <SwitchField name="isVisible" label={tc("visibleOnSite")} />
      <SwitchField name="isFeatured" label={tc("featured")} />
    </CrudModule>
  );
}
