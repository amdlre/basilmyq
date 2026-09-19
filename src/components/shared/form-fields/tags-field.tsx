"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type TagsFieldProps = BaseFieldProps & {
  /** Offered in the dropdown, usually the Settings → Lookup lists tags. */
  suggestions?: string[];
};

/**
 * Multi-select chips over shadcn studio's combobox-10. Picks from the
 * suggestions, and anything typed that is not in them can still be added.
 */
export function TagsField({ suggestions = [], ...base }: TagsFieldProps) {
  const t = useTranslations("Form");
  const { control } = useFormContext();
  const anchor = useComboboxAnchor();
  const [query, setQuery] = useState("");

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

            const draft = query.trim();
            const known = [...new Set([...suggestions, ...tags])];
            const isNew =
              draft !== "" &&
              !known.some((item) => item.toLowerCase() === draft.toLowerCase());
            // The typed value leads the list, so Enter adds it.
            const items = isNew ? [draft, ...known] : known;

            return (
              <Combobox
                multiple
                autoHighlight
                items={items}
                value={tags}
                disabled={base.disabled}
                inputValue={query}
                onInputValueChange={setQuery}
                onValueChange={(next: string[]) => {
                  field.onChange(
                    next.map((item) => item.trim()).filter(Boolean),
                  );
                  setQuery("");
                }}
              >
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {(values: string[]) => (
                      <>
                        {values.map((value) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          id={id}
                          aria-invalid={invalid}
                          placeholder={
                            values.length === 0
                              ? t("tagsPlaceholder")
                              : undefined
                          }
                          onBlur={field.onBlur}
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>

                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>{t("noTags")}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {isNew && item === draft ? (
                          <>
                            <PlusIcon className="size-4 text-muted-foreground" />
                            {t("createTag", { tag: item })}
                          </>
                        ) : (
                          item
                        )}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            );
          }}
        />
      )}
    </FieldWrapper>
  );
}
