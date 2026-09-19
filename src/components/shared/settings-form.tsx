"use client";

import { type ReactNode, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { useZodLocale } from "@/components/shared/zod-locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import type { FormActionResult } from "./form-dialog";

type SettingsFormProps<TValues extends FieldValues> = {
  schema: ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  action: (values: TValues) => Promise<FormActionResult>;
  children: ReactNode;
};

/**
 * The inline sibling of FormDialog: same validation, same field components, same
 * toast contract, but for editing something that already exists in place rather
 * than creating a record in a modal.
 */
export function SettingsForm<TValues extends FieldValues>({
  schema,
  defaultValues,
  action,
  children,
}: SettingsFormProps<TValues>) {
  // Validation messages follow the active language.
  useZodLocale();
  const t = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver<TValues, unknown, TValues>(schema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await action(values);

      if (result.ok) {
        toast.success(result.message ?? t("saved"));
        // Reset so the form is no longer dirty against what was just saved.
        form.reset(values);
        return;
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as never, { type: "server", message });
        }
      }
      toast.error(result.message ?? t("somethingWentWrong"));
    });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        {/* `overflow-visible` lets the footer stick; Card clips by default. */}
        <Card className="overflow-visible">
          {/* One column on phones, three on wide screens. Long text, rich
              text and section headings span the full row. */}
          <CardContent className="grid gap-5 pt-6 md:grid-cols-2 xl:grid-cols-3 [&>p]:col-span-full">
            {children}
          </CardContent>
          {/* Save stays in reach however long the form is. */}
          <CardFooter className="sticky bottom-0 z-10 justify-end border-t bg-card">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
