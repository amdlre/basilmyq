"use client";

import { useMemo } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { FormStep } from "@/components/shared/form-stepper";
import type { FilterConfig } from "@/components/shared/data-table/types";
import {
  ImageField,
  RichTextField,
  SelectField,
  SlugField,
  SwitchField,
  TagsField,
  TextField,
} from "@/components/shared/form-fields";
import type { AppLocale } from "@/i18n/routing";
import { projectSchema, type ProjectInput } from "@/lib/validations/content";
import type {
  ProjectCategoryRow,
  ProjectRow,
} from "@/server/queries/dashboard";

import { projectColumns } from "./columns";

const STATUSES = ["COMPLETED", "IN_PROGRESS", "DRAFT", "ARCHIVED"] as const;

const EMPTY: ProjectInput = {
  titleAr: "",
  titleEn: "",
  slug: "",
  summaryAr: "",
  summaryEn: "",
  contentAr: "",
  contentEn: "",
  coverUrl: null,
  gallery: [],
  liveUrl: null,
  repoUrl: null,
  status: "DRAFT",
  categoryId: null,
  tags: [],
  clientAr: null,
  clientEn: null,
  year: null,
  roleAr: null,
  roleEn: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

type Props = {
  rows: ProjectRow[];
  categories: ProjectCategoryRow[];
  tagSuggestions: string[];
};

export function ProjectsClient({ rows, categories, tagSuggestions }: Props) {
  const t = useTranslations("Projects");
  const tc = useTranslations("Columns");
  const tCrud = useTranslations("Crud");
  const locale = useLocale() as AppLocale;

  const statusLabels = {
    COMPLETED: t("status.COMPLETED"),
    IN_PROGRESS: t("status.IN_PROGRESS"),
    DRAFT: t("status.DRAFT"),
    ARCHIVED: t("status.ARCHIVED"),
  };

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: locale === "ar" ? category.nameAr : category.nameEn,
  }));

  const columns = useMemo(
    () =>
      projectColumns({
        locale,
        common,
        labels: {
          title: tc("title"),
          status: tc("status"),
          category: tc("category"),
          year: tc("year"),
          uncategorised: t("uncategorised"),
          statusLabels,
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: tc("status"),
      options: STATUSES.map((value) => ({ value, label: statusLabels[value] })),
    },
    {
      key: "category",
      label: tc("category"),
      options: categoryOptions,
    },
    {
      key: "isVisible",
      label: tc("visibility"),
      options: [
        { value: "true", label: tc("visible") },
        { value: "false", label: tc("hidden") },
      ],
    },
  ];

  return (
    <CrudModule<ProjectRow, ProjectInput>
      entity="project"
      rows={rows}
      columns={columns}
      schema={projectSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        titleAr: row.titleAr,
        titleEn: row.titleEn,
        slug: row.slug,
        summaryAr: row.summaryAr,
        summaryEn: row.summaryEn,
        contentAr: row.contentAr,
        contentEn: row.contentEn,
        coverUrl: row.coverUrl,
        gallery: row.gallery,
        liveUrl: row.liveUrl,
        repoUrl: row.repoUrl,
        status: row.status,
        categoryId: row.categoryId,
        tags: row.tags,
        clientAr: row.clientAr,
        clientEn: row.clientEn,
        year: row.year,
        roleAr: row.roleAr,
        roleEn: row.roleEn,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="projects"
      exportFileName="projects"
      searchKeys={["title"]}
      filters={filters}
      enableRowReorder
      extraRowActions={[
        {
          id: "view",
          label: tCrud("viewOnSite"),
          icon: ExternalLinkIcon,
          hidden: (row) => !row.isVisible,
          run: (row) => {
            window.open(`/${locale}/projects/${row.slug}`, "_blank");
          },
        },
      ]}
    >
      <FormStep id="basics">
        <TextField name="titleAr" label={t("fields.titleAr")} />
        <TextField name="titleEn" label={t("fields.titleEn")} dir="ltr" />
        <SlugField name="slug" source="titleEn" label={t("fields.slug")} />
        <SelectField
          name="status"
          label={tc("status")}
          options={STATUSES.map((value) => ({
            value,
            label: statusLabels[value],
          }))}
        />
        <SelectField
          name="categoryId"
          label={tc("category")}
          options={categoryOptions}
        />
      </FormStep>
      <FormStep id="content">
        <TextField name="summaryAr" label={t("fields.summaryAr")} multiline />
        <TextField name="summaryEn" label={t("fields.summaryEn")} multiline />
        <RichTextField name="contentAr" label={t("fields.contentAr")} />
        <RichTextField name="contentEn" label={t("fields.contentEn")} />
      </FormStep>
      <FormStep id="details">
        <ImageField name="coverUrl" label={t("fields.cover")} />
        <TagsField
          name="tags"
          label={tc("tags")}
          suggestions={tagSuggestions}
        />
        <TextField name="clientAr" label={t("fields.clientAr")} />
        <TextField name="clientEn" label={t("fields.clientEn")} dir="ltr" />
        <TextField name="year" label={tc("year")} type="number" dir="ltr" />
        <TextField name="roleAr" label={t("fields.roleAr")} />
        <TextField name="roleEn" label={t("fields.roleEn")} dir="ltr" />
        <TextField
          name="liveUrl"
          label={t("fields.liveUrl")}
          type="url"
          dir="ltr"
        />
        <TextField
          name="repoUrl"
          label={t("fields.repoUrl")}
          type="url"
          dir="ltr"
        />
      </FormStep>
      <FormStep id="publishing">
        <TextField name="order" label={tc("order")} type="number" dir="ltr" />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
        <SwitchField name="isFeatured" label={tc("featured")} />
      </FormStep>
    </CrudModule>
  );
}
