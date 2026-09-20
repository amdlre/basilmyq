"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

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

import { formatPickedDate } from "./date-field";
import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type DateRangeFieldProps = Omit<BaseFieldProps, "name"> & {
  /** The field holding the start of the range. */
  name: string;
  /** The field holding the end; left empty for anything still running. */
  endName: string;
};

/**
 * One calendar for a start and an end date, after shadcn studio's
 * date-picker-02. A period is picked as a period rather than as two fields
 * that can silently contradict each other.
 */
export function DateRangeField({ endName, ...base }: DateRangeFieldProps) {
  const { setValue, control } = useFormContext();
  const t = useTranslations("Form");
  const locale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);

  const from = toDate(
    useWatch({ control, name: base.name }) as Date | string | null,
  );
  const to = toDate(
    useWatch({ control, name: endName }) as Date | string | null,
  );

  const label = from
    ? `${formatPickedDate(from, locale)} — ${
        to ? formatPickedDate(to, locale) : t("present")
      }`
    : t("pickRange");

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={base.disabled}
              aria-invalid={invalid}
              className={cn(
                "w-full justify-between font-normal",
                !from && "text-muted-foreground",
              )}
            >
              {label}
              <CalendarIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            dir={getLocaleDirection(locale)}
          >
            <Calendar
              mode="range"
              selected={{ from: from ?? undefined, to: to ?? undefined }}
              defaultMonth={from ?? undefined}
              captionLayout="dropdown"
              dir={getLocaleDirection(locale)}
              onSelect={(range) => {
                // Validation stays with the schema; this only keeps the two
                // fields consistent with what was picked.
                setValue(base.name, range?.from ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue(endName, range?.to ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </FieldWrapper>
  );
}
