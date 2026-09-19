"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

type SocialLinksFieldProps = {
  name: string;
  label: string;
  description?: string;
};

/** The dynamic social-links list from Settings → Contact. */
export function SocialLinksField({
  name,
  label,
  description,
}: SocialLinksFieldProps) {
  const t = useTranslations("Settings");
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Field className="col-span-full">
      <FieldLabel>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-wrap gap-2">
            <Input
              placeholder={t("social.label")}
              aria-label={t("social.label")}
              className="min-w-28 flex-1"
              {...register(`${name}.${index}.label`)}
            />
            <Input
              placeholder={t("social.icon")}
              aria-label={t("social.icon")}
              dir="ltr"
              className="min-w-24 flex-1"
              {...register(`${name}.${index}.icon`)}
            />
            <Input
              placeholder={t("social.url")}
              aria-label={t("social.url")}
              dir="ltr"
              className="min-w-40 flex-[2]"
              {...register(`${name}.${index}.url`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("social.remove")}
              onClick={() => remove(index)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: "", url: "", icon: "" })}
        >
          <PlusIcon />
          {t("social.add")}
        </Button>
      </div>
    </Field>
  );
}
