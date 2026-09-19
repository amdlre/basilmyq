"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { FormStep } from "@/components/shared/form-stepper";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  dateColumn,
  featuredColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  DateField,
  ImageField,
  RichTextField,
  SlugField,
  SwitchField,
  TagsField,
  TextField,
} from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppLocale } from "@/i18n/routing";
import { postSchema, type PostInput } from "@/lib/validations/content";
import type { PostRow } from "@/server/queries/dashboard";

const EMPTY: PostInput = {
  titleAr: "",
  titleEn: "",
  slug: "",
  excerptAr: "",
  excerptEn: "",
  contentAr: "",
  contentEn: "",
  coverUrl: null,
  tags: [],
  readTimeMinutes: 5,
  publishedAt: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

export function BlogClient({ rows }: { rows: PostRow[] }) {
  const t = useTranslations("Blog");
  const tc = useTranslations("Columns");
  const tCrud = useTranslations("Crud");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const columns = useMemo<ColumnDef<PostRow, unknown>[]>(
    () => [
      bilingualColumn<PostRow>({
        id: "title",
        label: tc("title"),
        ar: (row) => row.titleAr,
        en: (row) => row.titleEn,
        locale,
        size: 280,
        isCardTitle: true,
      }),
      {
        id: "state",
        accessorFn: (row) => (row.publishedAt ? "published" : "draft"),
        size: 120,
        meta: {
          label: tc("status"),
          exportValue: (row) =>
            (row as PostRow).publishedAt ? t("published") : t("draft"),
        },
        filterFn: (row, id, value: string[]) =>
          value.includes(String(row.getValue(id))),
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("status")} />
        ),
        cell: ({ row }) =>
          row.original.publishedAt ? (
            <StatusBadge label={t("published")} tone="success" />
          ) : (
            <StatusBadge label={t("draft")} tone="warning" />
          ),
      },
      dateColumn<PostRow>({
        id: "publishedAt",
        label: tc("publishedAt"),
        value: (row) => row.publishedAt,
        locale,
      }),
      {
        accessorKey: "views",
        id: "views",
        size: 110,
        meta: { label: tc("views"), align: "end" },
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("views")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.views.toLocaleString(
              locale === "ar" ? "ar-EG" : "en-US",
            )}
          </span>
        ),
      },
      visibilityColumn<PostRow>(common),
      featuredColumn<PostRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  return (
    <CrudModule<PostRow, PostInput>
      entity="post"
      rows={rows}
      columns={columns}
      schema={postSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        titleAr: row.titleAr,
        titleEn: row.titleEn,
        slug: row.slug,
        excerptAr: row.excerptAr,
        excerptEn: row.excerptEn,
        contentAr: row.contentAr,
        contentEn: row.contentEn,
        coverUrl: row.coverUrl,
        tags: row.tags,
        readTimeMinutes: row.readTimeMinutes,
        publishedAt: row.publishedAt,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="blog"
      exportFileName="blog"
      searchKeys={["title"]}
      filters={[
        {
          key: "state",
          label: tc("status"),
          options: [
            { value: "published", label: t("published") },
            { value: "draft", label: t("draft") },
          ],
        },
        {
          key: "isVisible",
          label: tc("visibility"),
          options: [
            { value: "true", label: tc("visible") },
            { value: "false", label: tc("hidden") },
          ],
        },
      ]}
      extraRowActions={[
        {
          id: "view",
          label: tCrud("viewOnSite"),
          icon: ExternalLinkIcon,
          hidden: (row) => !row.isVisible || !row.publishedAt,
          run: (row) => {
            window.open(`/${locale}/blog/${row.slug}`, "_blank");
          },
        },
      ]}
    >
      <FormStep id="basics">
        <TextField name="titleAr" label={t("fields.titleAr")} />
        <TextField name="titleEn" label={t("fields.titleEn")} dir="ltr" />
        <SlugField name="slug" source="titleEn" label={t("fields.slug")} />
        <TextField name="excerptAr" label={t("fields.excerptAr")} multiline />
        <TextField name="excerptEn" label={t("fields.excerptEn")} multiline />
      </FormStep>
      <FormStep id="content">
        <RichTextField name="contentAr" label={t("fields.contentAr")} />
        <RichTextField name="contentEn" label={t("fields.contentEn")} />
      </FormStep>
      <FormStep id="details">
        <ImageField name="coverUrl" label={t("fields.cover")} />
        <TagsField name="tags" label={tc("tags")} />
        <TextField
          name="readTimeMinutes"
          label={t("fields.readTime")}
          type="number"
          dir="ltr"
        />
        <DateField name="publishedAt" label={t("fields.publishedAt")} />
      </FormStep>
      <FormStep id="publishing">
        <TextField name="order" label={tc("order")} type="number" dir="ltr" />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
        <SwitchField name="isFeatured" label={tc("featured")} />
      </FormStep>
    </CrudModule>
  );
}
