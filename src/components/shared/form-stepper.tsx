"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

/** The step names every multi-part form shares, labelled in `FormSteps`. */
export type FormStepId = "basics" | "content" | "details" | "publishing";

type FormStepProps = {
  id: FormStepId;
  children: ReactNode;
};

/**
 * One page of a multi-step form. A form host renders it; modules only group
 * their fields with it.
 */
export function FormStep({ children }: FormStepProps) {
  return <div className="space-y-5">{children}</div>;
}

export type CollectedStep = {
  id: FormStepId;
  /** Every field `name` inside the step, used to validate it on its own. */
  fields: string[];
  content: ReactNode;
};

function collectFieldNames(node: ReactNode): string[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement<{ name?: unknown; children?: ReactNode }>(child)) {
      return [];
    }
    const own = typeof child.props.name === "string" ? [child.props.name] : [];
    return [...own, ...collectFieldNames(child.props.children)];
  });
}

/** The `<FormStep>` children of a form, or an empty list for a flat form. */
export function collectSteps(children: ReactNode): CollectedStep[] {
  return Children.toArray(children)
    .filter(
      (child): child is ReactElement<FormStepProps> =>
        isValidElement(child) && child.type === FormStep,
    )
    .map((step) => ({
      id: step.props.id,
      fields: collectFieldNames(step.props.children),
      content: step,
    }));
}

type FormStepperNavProps = {
  steps: CollectedStep[];
  current: FormStepId;
  onChange: (id: FormStepId) => void;
  /** Steps holding a validation error, flagged on their indicator. */
  invalid: FormStepId[];
};

/** The step indicator strip, styled after shadcn studio's stepper-03. */
export function FormStepperNav({
  steps,
  current,
  onChange,
  invalid,
}: FormStepperNavProps) {
  const t = useTranslations("FormSteps");
  const definitions = steps.map((step) => ({
    id: step.id,
    title: t(`${step.id}.title`),
  }));

  return (
    <Stepper
      steps={definitions}
      value={current}
      onValueChange={(id) => onChange(id as FormStepId)}
      className="flex w-full items-center"
    >
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem
            key={step.id}
            stepId={step.id}
            className="relative flex-1"
          >
            <StepperTrigger type="button" className="flex flex-col gap-2.5">
              <StepperIndicator
                className={cn(
                  invalid.includes(step.id) &&
                    "bg-destructive/15 text-destructive group-data-[state=active]/step:ring-destructive/30 data-[state=active]:bg-destructive/15 data-[state=active]:text-destructive data-[state=completed]:bg-destructive/15 data-[state=completed]:text-destructive",
                )}
              >
                {index + 1}
              </StepperIndicator>
              <div className="flex flex-col">
                <StepperTitle>{t(`${step.id}.title`)}</StepperTitle>
                <StepperDescription className="text-nowrap max-sm:hidden">
                  {t(`${step.id}.description`)}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {index < steps.length - 1 ? (
              <StepperSeparator className="absolute inset-x-0 start-[calc(50%+18px)] end-[calc(-50%+18px)] top-2" />
            ) : null}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}
