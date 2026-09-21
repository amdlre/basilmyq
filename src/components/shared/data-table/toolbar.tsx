"use client";

import { useState, useTransition } from "react";
import type { Table } from "@tanstack/react-table";
import {
  DownloadIcon,
  RotateCcwIcon,
  Rows2Icon,
  Rows3Icon,
  SearchIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DropdownToggleItem } from "@/components/shared/dropdown-toggle-item";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";

import { exportTable } from "./export";
import { FacetedFilter } from "./faceted-filter";
import type {
  ExportFormat,
  ExportScope,
  FilterConfig,
  TableDensity,
} from "./types";

const EXPORT_FORMATS: ExportFormat[] = ["csv", "xlsx", "json", "pdf"];

type ToolbarProps<TData> = {
  table: Table<TData>;
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  filterValues: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  onResetPreferences: () => void;
  exportFileName: string;
  searchable: boolean;
};

export function Toolbar<TData>({
  table,
  search,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  density,
  onDensityChange,
  onResetPreferences,
  exportFileName,
  searchable,
}: ToolbarProps<TData>) {
  const t = useTranslations("DataTable");
  const locale = useLocale() as AppLocale;
  const [isExporting, startExport] = useTransition();
  const [exportScope, setExportScope] = useState<ExportScope>("all");

  const hasActiveFilters =
    search.length > 0 ||
    Object.values(filterValues).some((values) => values.length > 0);

  const runExport = (format: ExportFormat) => {
    startExport(async () => {
      await exportTable(
        table,
        format,
        exportScope,
        exportFileName,
        getLocaleDirection(locale),
      );
    });
  };

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchable ? (
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="h-9 ps-8"
          />
        </div>
      ) : null}

      {filters.map((filter) => (
        <FacetedFilter
          key={filter.key}
          filter={filter}
          selected={filterValues[filter.key] ?? []}
          onChange={(values) => onFilterChange(filter.key, values)}
        />
      ))}

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange("");
            for (const filter of filters) onFilterChange(filter.key, []);
          }}
        >
          <XIcon className="size-4" />
          {t("clearAll")}
        </Button>
      ) : null}

      <div className="ms-auto flex items-center gap-2">
        {/* Density */}
        <Button
          variant="outline"
          size="sm"
          aria-label={t("density")}
          onClick={() =>
            onDensityChange(
              density === "comfortable" ? "compact" : "comfortable",
            )
          }
        >
          {density === "comfortable" ? (
            <Rows3Icon className="size-4" />
          ) : (
            <Rows2Icon className="size-4" />
          )}
        </Button>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2Icon className="size-4" />
              <span className="hidden sm:inline">{t("columns")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("toggleColumns")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideableColumns.map((column) => (
              <DropdownToggleItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(value)}
              >
                {column.columnDef.meta?.label ?? column.id}
              </DropdownToggleItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onResetPreferences}>
              <RotateCcwIcon className="size-4" />
              {t("resetLayout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isExporting}>
              <DownloadIcon className="size-4" />
              <span className="hidden sm:inline">{t("export")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{t("exportScope")}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={exportScope === "page"}
              onCheckedChange={() => setExportScope("page")}
              onSelect={(event) => event.preventDefault()}
            >
              {t("currentPage")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={exportScope === "all"}
              onCheckedChange={() => setExportScope("all")}
              onSelect={(event) => event.preventDefault()}
            >
              {t("allRows")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t("exportAs")}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {EXPORT_FORMATS.map((format) => (
                  <DropdownMenuItem
                    key={format}
                    onSelect={() => runExport(format)}
                  >
                    {t(`format.${format}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {t("exportNote")}
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
