"use client";

import { useActionState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { type LoginInput, loginSchema } from "@/lib/validations/auth";
import { type LoginState, login } from "@/server/actions/auth";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const t = useTranslations("Login");
  const [state, formAction] = useActionState(login, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  // Same Zod schema the Server Action re-validates with.
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    startTransition(() => formAction(formData));
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="username"
                autoFocus
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <Input
                id="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            {/* Server-side failures are deliberately generic. */}
            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/">{t("backToSite")}</Link>
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
