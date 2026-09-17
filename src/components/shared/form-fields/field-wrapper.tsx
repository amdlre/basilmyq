"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export type BaseFieldProps = {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type FieldWrapperProps = BaseFieldProps & {
  children: (props: { id: string; invalid: boolean }) => ReactNode;
  orientation?: "vertical" | "horizontal";
};

/**
 * Label, description and error rendering, written once.
 *
 * Every `*Field` picks the form up from context, so no field ever receives a
 * `control` prop and no field repeats this markup.
 */
export function FieldWrapper({
  name,
  label,
  description,
  children,
  orientation = "vertical",
}: FieldWrapperProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const message =
    typeof error?.message === "string" ? error.message : undefined;
  const id = `field-${name}`;

  return (
    <Field
      orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({ id, invalid: Boolean(error) })}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError>{message}</FieldError> : null}
    </Field>
  );
}
