"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

/** Native date input: keyboard-friendly, and correct in both directions. */
export function DateField(base: BaseFieldProps) {
  const { control } = useFormContext();

  const toInputValue = (value: unknown): string => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime())
      ? ""
      : (date.toISOString().split("T")[0] ?? "");
  };

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => (
            <Input
              id={id}
              type="date"
              dir="ltr"
              disabled={base.disabled}
              aria-invalid={invalid}
              value={toInputValue(field.value)}
              onChange={(event) =>
                field.onChange(
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          )}
        />
      )}
    </FieldWrapper>
  );
}
