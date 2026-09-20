"use client";

import { useState } from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type AppLocale, getLocaleDirection } from "@/i18n/routing";
import { toDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

/** One date format for every picker in the app. */
export function formatPickedDate(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Calendar in a popover, after shadcn studio's date-picker-12: month and year
 * dropdowns rather than paging through a decade a month at a time.
 */
export function DateField(base: BaseFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations("Form");
  const locale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => {
            const selected = toDate(field.value as Date | string | null);

            return (
              <div className="flex items-center gap-1">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id={id}
                      type="button"
                      variant="outline"
                      disabled={base.disabled}
                      aria-invalid={invalid}
                      className={cn(
                        "flex-1 justify-between font-normal",
                        !selected && "text-muted-foreground",
                      )}
                    >
                      {selected
                        ? formatPickedDate(selected, locale)
                        : t("pickDate")}
                      <CalendarIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    dir={getLocaleDirection(locale)}
                  >
                    <Calendar
                      mode="single"
                      selected={selected ?? undefined}
                      defaultMonth={selected ?? undefined}
                      captionLayout="dropdown"
                      dir={getLocaleDirection(locale)}
                      onSelect={(date) => {
                        field.onChange(date ?? null);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {selected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("clearDate")}
                    disabled={base.disabled}
                    onClick={() => field.onChange(null)}
                  >
                    <XIcon />
                  </Button>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </FieldWrapper>
  );
}
