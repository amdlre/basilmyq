"use client";

import type { ReactNode } from "react";
import { useEffect, useTransition } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type FormActionResult = {
  ok: boolean;
  message?: string;
  /** Server-side field errors, keyed by field name. */
  fieldErrors?: Record<string, string>;
};

type FormSheetProps<TValues extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** The same schema the Server Action validates with — rule 6. */
  schema: ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  action: (values: TValues) => Promise<FormActionResult>;
  submitLabel?: string;
  children: ReactNode;
};

/**
 * The single host for every create and edit form in the dashboard.
 *
 * It owns validation, submission, toasts and server-side field errors, so a
 * module contributes nothing but a schema and a list of fields.
 */
export function FormSheet<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  action,
  submitLabel,
  children,
}: FormSheetProps<TValues>) {
  // Validation messages follow the active language.
  useZodLocale();
  const t = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver<TValues, unknown, TValues>(schema),
    defaultValues,
  });

  // Re-seed when switching between records without unmounting the sheet.
  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await action(values);

      if (result.ok) {
        toast.success(result.message ?? t("saved"));
        onOpenChange(false);
        return;
      }

      // Rule 9: every failure surfaces, and field errors land on their field.
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as never, { type: "server", message });
        }
      }
      toast.error(result.message ?? t("somethingWentWrong"));
    });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>

        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              {children}
            </div>

            <SheetFooter className="flex-row justify-end gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  (submitLabel ?? t("save"))
                )}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
