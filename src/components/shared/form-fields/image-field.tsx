"use client";

import { Controller, useFormContext } from "react-hook-form";

import { ImageUpload } from "@/components/shared/image-upload";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type ImageFieldProps = BaseFieldProps & {
  onUpload?: (file: File) => Promise<string>;
  /** A short strip instead of a 16:9 box — for logos and icons. */
  compact?: boolean;
};

export function ImageField({ onUpload, compact, ...base }: ImageFieldProps) {
  const { control } = useFormContext();

  return (
    <FieldWrapper {...base}>
      {() => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => (
            <ImageUpload
              value={typeof field.value === "string" ? field.value : null}
              onChange={field.onChange}
              onUpload={onUpload}
              compact={compact}
              disabled={base.disabled}
              alt={base.label}
            />
          )}
        />
      )}
    </FieldWrapper>
  );
}
