"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import {
  collectSteps,
  FormStepperNav,
  type FormStepId,
} from "@/components/shared/form-stepper";
import { useZodLocale } from "@/components/shared/zod-locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type FormActionResult = {
  ok: boolean;
  message?: string;
  /** Server-side field errors, keyed by field name. */
  fieldErrors?: Record<string, string>;
};

type FormDialogProps<TValues extends FieldValues> = {
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
 * module contributes nothing but a schema and a list of fields. Grouping those
 * fields in `<FormStep>` turns the dialog into a stepper.
 */
export function FormDialog<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  action,
  submitLabel,
  children,
}: FormDialogProps<TValues>) {
  // Validation messages follow the active language.
  useZodLocale();
  const t = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver<TValues, unknown, TValues>(schema),
    defaultValues,
  });

  const steps = useMemo(() => collectSteps(children), [children]);
  const isStepped = steps.length > 0;
  const firstStep = steps[0]?.id;
  const [currentStep, setCurrentStep] = useState<FormStepId | undefined>(
    firstStep,
  );
  const stepIndex = steps.findIndex((step) => step.id === currentStep);
  const isLastStep = !isStepped || stepIndex === steps.length - 1;

  // Every opening starts from the first step.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setCurrentStep(firstStep);
  }

  // Re-seed when switching between records without unmounting the dialog.
  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues]);

  const stepsWithErrors = (errors: object): FormStepId[] => {
    const invalid = Object.keys(errors);
    return steps
      .filter((step) => step.fields.some((field) => invalid.includes(field)))
      .map((step) => step.id);
  };

  const invalidSteps = stepsWithErrors(form.formState.errors);

  const goToStep = (offset: number) => {
    const next = steps[stepIndex + offset];
    if (next) setCurrentStep(next.id);
  };

  // Moving forward validates only the step being left.
  const goForward = async () => {
    const fields = steps[stepIndex]?.fields ?? [];
    if (await form.trigger(fields as never)) goToStep(1);
  };

  // A failed submit opens the first step that holds an error.
  const showFirstInvalidStep = (errors: object) => {
    const [first] = stepsWithErrors(errors);
    if (first) setCurrentStep(first);
  };

  const submit = form.handleSubmit((values) => {
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
        showFirstInvalidStep(result.fieldErrors);
      }
      toast.error(result.message ?? t("somethingWentWrong"));
    });
  }, showFirstInvalidStep);

  // Enter inside a field advances the stepper instead of saving early.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isLastStep) return submit(event);
    event.preventDefault();
    return goForward();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* shadcn studio's dialog-26 zoom-in, at a large size so a four-step
          stepper and a rich-text editor fit without cramping. The body
          scrolls; header, stepper and footer stay put. */}
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-3xl data-open:duration-600 data-open:zoom-in-0!">
        <DialogHeader className="border-b p-4 pe-12">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            {isStepped && currentStep ? (
              <div className="border-b p-4">
                <FormStepperNav
                  steps={steps}
                  current={currentStep}
                  onChange={setCurrentStep}
                  invalid={invalidSteps}
                />
              </div>
            ) : null}

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              {isStepped
                ? steps.map((step) => (
                    // Hidden rather than unmounted, so editors keep their state.
                    <div
                      key={step.id}
                      role="tabpanel"
                      id={`stepper-panel-${step.id}`}
                      aria-labelledby={`stepper-tab-${step.id}`}
                      hidden={step.id !== currentStep}
                    >
                      {step.content}
                    </div>
                  ))
                : children}
            </div>

            <DialogFooter className="m-0 flex-row justify-end">
              {isStepped && stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="me-auto"
                  disabled={isPending}
                  onClick={() => goToStep(-1)}
                >
                  <ChevronLeftIcon className="rtl:rotate-180" />
                  {t("back")}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              {isLastStep ? null : (
                <Button type="button" onClick={() => void goForward()}>
                  {t("next")}
                  <ChevronRightIcon className="rtl:rotate-180" />
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className={cn(!isLastStep && "hidden")}
              >
                {isPending ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  (submitLabel ?? t("save"))
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
