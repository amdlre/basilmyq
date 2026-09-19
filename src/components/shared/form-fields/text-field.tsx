"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type TextFieldProps = BaseFieldProps & {
  type?: "text" | "email" | "url" | "number";
  placeholder?: string;
  /** Force LTR for fields that always hold Latin text (slugs, URLs, emails). */
  dir?: "ltr" | "rtl";
  multiline?: boolean;
  rows?: number;
};

export function TextField({
  type = "text",
  placeholder,
  dir,
  multiline = false,
  rows = 4,
  ...base
}: TextFieldProps) {
  const { register } = useFormContext();

  return (
    <FieldWrapper {...base} wide={multiline}>
      {({ id, invalid }) =>
        multiline ? (
          <Textarea
            id={id}
            rows={rows}
            dir={dir}
            placeholder={placeholder}
            disabled={base.disabled}
            aria-invalid={invalid}
            {...register(base.name)}
          />
        ) : (
          <Input
            id={id}
            type={type}
            dir={dir}
            placeholder={placeholder}
            disabled={base.disabled}
            aria-invalid={invalid}
            {...register(base.name, {
              valueAsNumber: type === "number",
            })}
          />
        )
      }
    </FieldWrapper>
  );
}
