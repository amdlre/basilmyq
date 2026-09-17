"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocaleDirection, type AppLocale } from "@/i18n/routing";

const PAGE_SIZES = [10, 20, 50, 100];

type PaginationProps<TData> = {
  table: Table<TData>;
};

export function Pagination<TData>({ table }: PaginationProps<TData>) {
  const t = useTranslations("DataTable");
  const locale = useLocale() as AppLocale;
  const isRtl = getLocaleDirection(locale) === "rtl";

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  // In RTL "previous" points to the right, so the chevrons swap.
  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const FirstIcon = isRtl ? ChevronsRightIcon : ChevronsLeftIcon;
  const LastIcon = isRtl ? ChevronsLeftIcon : ChevronsRightIcon;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm text-muted-foreground">
        {t("rowCount", { count: totalRows })}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {t("rowsPerPage")}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm font-medium whitespace-nowrap">
          {t("pageOf", {
            page: pageCount === 0 ? 0 : pageIndex + 1,
            total: pageCount,
          })}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("firstPage")}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <FirstIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("previousPage")}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <PrevIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("nextPage")}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <NextIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("lastPage")}
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <LastIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
