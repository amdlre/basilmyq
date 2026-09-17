"use client";

import { WandSparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type SlugFieldProps = BaseFieldProps & {
  /** Field whose value the slug is generated from. */
  source: string;
};

export function SlugField({ source, ...base }: SlugFieldProps) {
  const t = useTranslations("Form");
  const { register, setValue, control } = useFormContext();
  const sourceValue = useWatch({ control, name: source }) as unknown;

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <div className="flex gap-2">
          <Input
            id={id}
            dir="ltr"
            disabled={base.disabled}
            aria-invalid={invalid}
            {...register(base.name)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("generateSlug")}
            disabled={base.disabled || typeof sourceValue !== "string"}
            onClick={() => {
              if (typeof sourceValue !== "string") return;
              setValue(base.name, slugify(sourceValue), {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          >
            <WandSparklesIcon className="size-4" />
          </Button>
        </div>
      )}
    </FieldWrapper>
  );
}
