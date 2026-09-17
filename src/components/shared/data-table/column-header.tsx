"use client";

import type { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  EyeOffIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

export function ColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: ColumnHeaderProps<TData, TValue>) {
  const t = useTranslations("DataTable");

  if (!column.getCanSort() && !column.getCanHide()) {
    return <span className={cn("font-medium", className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const SortIcon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("-ms-2 h-8 gap-1.5 font-medium", className)}
        >
          {title}
          <SortIcon
            className={cn("size-3.5", !sorted && "text-muted-foreground")}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {column.getCanSort() ? (
          <>
            <DropdownMenuItem
              onSelect={() => column.toggleSorting(false, true)}
            >
              <ArrowUpIcon className="size-4" />
              {t("sortAscending")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => column.toggleSorting(true, true)}>
              <ArrowDownIcon className="size-4" />
              {t("sortDescending")}
            </DropdownMenuItem>
            {sorted ? (
              <DropdownMenuItem onSelect={() => column.clearSorting()}>
                <ArrowUpDownIcon className="size-4" />
                {t("clearSort")}
              </DropdownMenuItem>
            ) : null}
          </>
        ) : null}

        {column.getCanSort() && column.getCanHide() ? (
          <DropdownMenuSeparator />
        ) : null}

        {column.getCanHide() ? (
          <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
            <EyeOffIcon className="size-4" />
            {t("hideColumn")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
