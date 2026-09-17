"use client";

import { Controller, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = BaseFieldProps & {
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField({
  options,
  placeholder,
  ...base
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={field.onChange}
              disabled={base.disabled}
            >
              <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </FieldWrapper>
  );
}
