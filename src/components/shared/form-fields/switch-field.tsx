"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Switch } from "@/components/ui/switch";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

export function SwitchField(base: BaseFieldProps) {
  const { control } = useFormContext();

  return (
    <FieldWrapper {...base} orientation="horizontal">
      {({ id }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => (
            <Switch
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={base.disabled}
            />
          )}
        />
      )}
    </FieldWrapper>
  );
}
