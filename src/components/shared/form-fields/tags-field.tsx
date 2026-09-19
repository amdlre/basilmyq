"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type TagsFieldProps = BaseFieldProps & {
  /** Offered as one-click chips, filtered by what is being typed. */
  suggestions?: string[];
};

export function TagsField({ suggestions = [], ...base }: TagsFieldProps) {
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

            const needle = draft.trim().toLowerCase();
            const offered = suggestions.filter(
              (suggestion) =>
                !tags.includes(suggestion) &&
                suggestion.toLowerCase().includes(needle),
            );

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

                {offered.length > 0 ? (
                  <div
                    role="group"
                    className="flex flex-wrap gap-1.5"
                    aria-label={t("suggestedTags")}
                  >
                    {offered.map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={base.disabled}
                        // Keeps focus in the input, so its blur does not
                        // commit a half-typed draft first.
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => add(suggestion)}
                      >
                        <PlusIcon />
                        {suggestion}
                      </Button>
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
