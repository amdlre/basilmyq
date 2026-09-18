"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { TextField } from "@/components/shared/form-fields";
import { useZodLocale } from "@/components/shared/zod-locale-provider";
import { Button } from "@/components/ui/button";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { submitContact } from "@/server/actions/contact";

const EMPTY: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
  // Validation messages follow the active language.
  useZodLocale();
  const t = useTranslations("ContactPage");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactInput>({
    resolver: zodResolver<ContactInput, unknown, ContactInput>(contactSchema),
    defaultValues: EMPTY,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitContact(values);

      if (result.ok) {
        toast.success(t("success"));
        form.reset(EMPTY);
        return;
      }

      toast.error(
        result.error === "rate-limited"
          ? t("tooMany", { minutes: result.retryAfterMinutes ?? 60 })
          : t("error"),
      );
    });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField name="name" label={t("name")} />
        <TextField name="email" label={t("email")} type="email" dir="ltr" />
        <TextField name="subject" label={t("subject")} />
        <TextField name="message" label={t("message")} multiline rows={6} />

        {/*
          Honeypot: off-screen and hidden from assistive tech, so only a bot
          fills it. The schema rejects any non-empty value.
        */}
        <div aria-hidden className="sr-only">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircleIcon className="size-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              <SendIcon />
              {t("send")}
            </>
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
