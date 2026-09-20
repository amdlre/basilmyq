"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { CrudModule } from "@/components/shared/crud-module";
import {
  bilingualColumn,
  visibilityColumn,
} from "@/components/shared/data-table/common-columns";
import {
  ImageField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import type { AppLocale } from "@/i18n/routing";
import { heroCardSchema, type HeroCardInput } from "@/lib/validations/content";
import type { HeroCardRow } from "@/server/queries/dashboard";

const EMPTY: HeroCardInput = {
  titleAr: "",
  titleEn: "",
  imageUrl: null,
  isVisible: true,
  order: 0,
};

/** The cards under the intro section, managed like any other content list. */
export function HeroCards({ rows }: { rows: HeroCardRow[] }) {
  const t = useTranslations("Settings.heroCards");
  const tc = useTranslations("Columns");
  const locale = useLocale() as AppLocale;

  const columns = useMemo<ColumnDef<HeroCardRow, unknown>[]>(
    () => [
      bilingualColumn<HeroCardRow>({
        id: "title",
        label: tc("title"),
        ar: (row) => row.titleAr,
        en: (row) => row.titleEn,
        locale,
        isCardTitle: true,
      }),
      visibilityColumn<HeroCardRow>({
        visibility: tc("visibility"),
        visible: tc("visible"),
        hidden: tc("hidden"),
        featured: tc("featured"),
        yes: tc("yes"),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, tc],
  );

  return (
    <div className="space-y-2">
      <div>
        <p className="font-heading font-semibold">{t("title")}</p>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <CrudModule<HeroCardRow, HeroCardInput>
        entity="heroCard"
        rows={rows}
        columns={columns}
        schema={heroCardSchema}
        emptyValues={EMPTY}
        toFormValues={(row) => ({
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          imageUrl: row.imageUrl,
          isVisible: row.isVisible,
          order: row.order,
        })}
        singularLabel={t("singular")}
        storageKey="hero-cards"
        queryPrefix="cards"
        exportFileName="hero-cards"
        searchKeys={["title"]}
        enableRowReorder
      >
        <TextField name="titleAr" label={t("titleAr")} />
        <TextField name="titleEn" label={t("titleEn")} dir="ltr" />
        <ImageField compact name="imageUrl" label={t("image")} />
        <SwitchField name="isVisible" label={tc("visibleOnSite")} />
      </CrudModule>
    </div>
  );
}
