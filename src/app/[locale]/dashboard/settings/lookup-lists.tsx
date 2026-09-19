"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  SlugField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppLocale } from "@/i18n/routing";
import {
  projectCategorySchema,
  skillGroupSchema,
  tagSchema,
  type ProjectCategoryInput,
  type SkillGroupInput,
  type TagInput,
} from "@/lib/validations/content";
import type {
  ProjectCategoryRow,
  SkillGroupRow,
  TagRow,
} from "@/server/queries/dashboard";

const EMPTY_TAG: TagInput = { name: "", order: 0 };

const EMPTY_CATEGORY: ProjectCategoryInput = {
  nameAr: "",
  nameEn: "",
  slug: "",
  isVisible: true,
  order: 0,
};

const EMPTY_GROUP: SkillGroupInput = {
  nameAr: "",
  nameEn: "",
  isVisible: true,
  order: 0,
};

type Props = {
  tags: TagRow[];
  categories: ProjectCategoryRow[];
  groups: SkillGroupRow[];
};

/**
 * Values that would otherwise be retyped in every form. Each list is a plain
 * CrudModule; `queryPrefix` keeps their table state apart in the URL.
 */
export function LookupLists({ tags, categories, groups }: Props) {
  const t = useTranslations("Settings.lookups");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const tagColumns = useMemo<ColumnDef<TagRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        id: "name",
        size: 260,
        meta: { label: tc("name"), cardTitle: true },
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("name")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium" dir="auto">
            {row.original.name}
          </span>
        ),
      },
    ],
    [tc],
  );

  const categoryColumns = useMemo<ColumnDef<ProjectCategoryRow, unknown>[]>(
    () => [
      bilingualColumn<ProjectCategoryRow>({
        id: "name",
        label: tc("name"),
        ar: (row) => row.nameAr,
        en: (row) => row.nameEn,
        locale,
        isCardTitle: true,
      }),
      {
        accessorKey: "slug",
        id: "slug",
        size: 200,
        meta: { label: t("fields.slug") },
        header: ({ column }) => (
          <ColumnHeader column={column} title={t("fields.slug")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground" dir="ltr">
            {row.original.slug}
          </span>
        ),
      },
      visibilityColumn<ProjectCategoryRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  const groupColumns = useMemo<ColumnDef<SkillGroupRow, unknown>[]>(
    () => [
      bilingualColumn<SkillGroupRow>({
        id: "name",
        label: tc("name"),
        ar: (row) => row.nameAr,
        en: (row) => row.nameEn,
        locale,
        isCardTitle: true,
      }),
      visibilityColumn<SkillGroupRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, tc],
  );

  return (
    <Tabs defaultValue="tags" className="gap-4">
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      <TabsList variant="line">
        <TabsTrigger value="tags">{t("tags.title")}</TabsTrigger>
        <TabsTrigger value="categories">{t("categories.title")}</TabsTrigger>
        <TabsTrigger value="groups">{t("groups.title")}</TabsTrigger>
      </TabsList>

      <TabsContent value="tags">
        <CrudModule<TagRow, TagInput>
          entity="tag"
          rows={tags}
          columns={tagColumns}
          schema={tagSchema}
          emptyValues={EMPTY_TAG}
          toFormValues={(row) => ({ name: row.name, order: row.order })}
          singularLabel={t("tags.singular")}
          storageKey="lookup-tags"
          queryPrefix="tags"
          exportFileName="tags"
          searchKeys={["name"]}
          enableRowReorder
        >
          <TextField
            name="name"
            label={tc("name")}
            description={t("tags.hint")}
          />
        </CrudModule>
      </TabsContent>

      <TabsContent value="categories">
        <CrudModule<ProjectCategoryRow, ProjectCategoryInput>
          entity="projectCategory"
          rows={categories}
          columns={categoryColumns}
          schema={projectCategorySchema}
          emptyValues={EMPTY_CATEGORY}
          toFormValues={(row) => ({
            nameAr: row.nameAr,
            nameEn: row.nameEn,
            slug: row.slug,
            isVisible: row.isVisible,
            order: row.order,
          })}
          singularLabel={t("categories.singular")}
          storageKey="lookup-categories"
          queryPrefix="categories"
          exportFileName="project-categories"
          searchKeys={["name"]}
          enableRowReorder
        >
          <TextField name="nameAr" label={t("fields.nameAr")} />
          <TextField name="nameEn" label={t("fields.nameEn")} dir="ltr" />
          <SlugField name="slug" source="nameEn" label={t("fields.slug")} />
          <SwitchField name="isVisible" label={tc("visibleOnSite")} />
        </CrudModule>
      </TabsContent>

      <TabsContent value="groups">
        <CrudModule<SkillGroupRow, SkillGroupInput>
          entity="skillGroup"
          rows={groups}
          columns={groupColumns}
          schema={skillGroupSchema}
          emptyValues={EMPTY_GROUP}
          toFormValues={(row) => ({
            nameAr: row.nameAr,
            nameEn: row.nameEn,
            isVisible: row.isVisible,
            order: row.order,
          })}
          singularLabel={t("groups.singular")}
          storageKey="lookup-groups"
          queryPrefix="groups"
          exportFileName="skill-groups"
          searchKeys={["name"]}
          enableRowReorder
        >
          <TextField name="nameAr" label={t("fields.nameAr")} />
          <TextField name="nameEn" label={t("fields.nameEn")} dir="ltr" />
          <SwitchField name="isVisible" label={tc("visibleOnSite")} />
        </CrudModule>
      </TabsContent>
    </Tabs>
  );
}
