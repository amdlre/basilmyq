"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import { FormStep } from "@/components/shared/form-stepper";
import { ColumnHeader } from "@/components/shared/data-table/column-header";
import {
  bilingualColumn,
  featuredColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  SelectField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { Progress } from "@/components/ui/progress";
import type { AppLocale } from "@/i18n/routing";
import { skillSchema, type SkillInput } from "@/lib/validations/content";
import type { SkillGroupRow, SkillRow } from "@/server/queries/dashboard";

const EMPTY: SkillInput = {
  nameAr: "",
  nameEn: "",
  icon: null,
  level: 80,
  groupId: null,
  isVisible: true,
  isFeatured: false,
  order: 0,
};

type Props = { rows: SkillRow[]; groups: SkillGroupRow[] };

export function SkillsClient({ rows, groups }: Props) {
  const t = useTranslations("Skills");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const common = {
    visibility: tc("visibility"),
    visible: tc("visible"),
    hidden: tc("hidden"),
    featured: tc("featured"),
    yes: tc("yes"),
  };

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: locale === "ar" ? group.nameAr : group.nameEn,
  }));

  const columns = useMemo<ColumnDef<SkillRow, unknown>[]>(
    () => [
      bilingualColumn<SkillRow>({
        id: "name",
        label: tc("name"),
        ar: (row) => row.nameAr,
        en: (row) => row.nameEn,
        locale,
        size: 220,
        isCardTitle: true,
      }),
      {
        id: "group",
        accessorFn: (row) => row.groupId ?? "",
        size: 180,
        meta: {
          label: tc("group"),
          exportValue: (row) => {
            const group = (row as SkillRow).group;
            if (!group) return t("ungrouped");
            return locale === "ar" ? group.nameAr : group.nameEn;
          },
        },
        filterFn: (row, id, value: string[]) =>
          value.includes(String(row.getValue(id))),
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("group")} />
        ),
        cell: ({ row }) => {
          const group = row.original.group;
          return (
            <span className="text-muted-foreground">
              {group
                ? locale === "ar"
                  ? group.nameAr
                  : group.nameEn
                : t("ungrouped")}
            </span>
          );
        },
      },
      {
        accessorKey: "level",
        id: "level",
        size: 160,
        meta: {
          label: tc("level"),
          exportValue: (row) => (row as SkillRow).level,
        },
        header: ({ column }) => (
          <ColumnHeader column={column} title={tc("level")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.level} className="h-1.5" />
            <span className="w-9 text-xs text-muted-foreground tabular-nums">
              {row.original.level}%
            </span>
          </div>
        ),
      },
      visibilityColumn<SkillRow>(common),
      featuredColumn<SkillRow>(common),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t, tc],
  );

  return (
    <CrudModule<SkillRow, SkillInput>
      entity="skill"
      rows={rows}
      columns={columns}
      schema={skillSchema}
      emptyValues={EMPTY}
      toFormValues={(row) => ({
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        icon: row.icon,
        level: row.level,
        groupId: row.groupId,
        isVisible: row.isVisible,
        isFeatured: row.isFeatured,
        order: row.order,
      })}
      singularLabel={t("singular")}
      storageKey="skills"
      exportFileName="skills"
      searchKeys={["name"]}
      enableRowReorder
      filters={[{ key: "group", label: tc("group"), options: groupOptions }]}
    >
      <FormStep id="basics">
        <TextField name="nameAr" label={t("fields.nameAr")} />
        <TextField name="nameEn" label={t("fields.nameEn")} dir="ltr" />
        <SelectField
          name="groupId"
          label={t("fields.group")}
          options={groupOptions}
        />
        <TextField
          name="level"
          label={t("fields.level")}
          type="number"
          dir="ltr"
        />
        <TextField name="icon" label={t("fields.icon")} dir="ltr" />
      </FormStep>
      <FormStep id="publishing">
        <TextField name="order" label={tc("order")} type="number" dir="ltr" />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
        <SwitchField name="isFeatured" label={tc("featured")} />
      </FormStep>
    </CrudModule>
  );
}
