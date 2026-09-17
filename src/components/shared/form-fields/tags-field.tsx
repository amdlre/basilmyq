"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

export function TagsField(base: BaseFieldProps) {
  const t = useTranslations("Form");
  const { control } = useFormContext();
  const [draft, setDraft] = useState("");

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => {
            const tags: string[] = Array.isArray(field.value)
              ? (field.value as string[])
              : [];

            const add = (value: string) => {
              const tag = value.trim();
              if (!tag || tags.includes(tag)) return;
              field.onChange([...tags, tag]);
              setDraft("");
            };

            return (
              <div className="space-y-2">
                <Input
                  id={id}
                  value={draft}
                  aria-invalid={invalid}
                  disabled={base.disabled}
                  placeholder={t("tagsPlaceholder")}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      add(draft);
                      return;
                    }
                    // Backspace on an empty input removes the last tag.
                    if (event.key === "Backspace" && draft === "") {
                      field.onChange(tags.slice(0, -1));
                    }
                  }}
                  onBlur={() => add(draft)}
                />

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          aria-label={t("removeTag", { tag })}
                          onClick={() =>
                            field.onChange(tags.filter((item) => item !== tag))
                          }
                          className="hover:text-destructive"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </FieldWrapper>
  );
}
