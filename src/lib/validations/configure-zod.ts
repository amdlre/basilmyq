import { z } from "zod";

import type { AppLocale } from "@/i18n/routing";

/** Reads one message from the `Validation` namespace. */
export type ValidationMessageKey =
  | "required"
  | "tooShort"
  | "tooLong"
  | "tooFew"
  | "tooMany"
  | "tooSmall"
  | "tooBig"
  | "email"
  | "url"
  | "format"
  | "invalid";

export type ValidationTranslator = (
  key: ValidationMessageKey,
  values?: Record<string, number | string>,
) => string;

const isBlank = (input: unknown): boolean =>
  input === undefined || input === null || input === "";

/**
 * Zod's own messages describe the check that failed — "Too small: expected
 * string to have >=1 characters" — which tells someone filling in a form
 * nothing they can act on, and reads badly in Arabic on top of that. This maps
 * every issue a form can raise onto one plain sentence, and an empty field
 * always reads as "required" whatever constraint tripped first.
 *
 * Codes not listed here fall through to Zod's locale, which is still loaded.
 */
export function plainMessage(
  // Raw while Zod is formatting a message, finalised when a server action
  // reads `error.issues` afterwards. The two differ only in what is optional.
  issue: z.core.$ZodRawIssue | z.core.$ZodIssue,
  t: ValidationTranslator,
): string | undefined {
  switch (issue.code) {
    case "invalid_type":
      return t("required");

    case "too_small": {
      if (isBlank(issue.input)) return t("required");
      const min = Number(issue.minimum);
      if (issue.origin === "string") return t("tooShort", { min });
      if (issue.origin === "array" || issue.origin === "set")
        return t("tooFew", { min });
      return t("tooSmall", { min });
    }

    case "too_big": {
      const max = Number(issue.maximum);
      if (issue.origin === "string") return t("tooLong", { max });
      if (issue.origin === "array" || issue.origin === "set")
        return t("tooMany", { max });
      return t("tooBig", { max });
    }

    case "invalid_format": {
      if (isBlank(issue.input)) return t("required");
      if (issue.format === "email") return t("email");
      if (issue.format === "url") return t("url");
      return t("format");
    }

    case "invalid_value":
    case "invalid_union":
    case "invalid_element":
    case "invalid_key":
      return isBlank(issue.input) ? t("required") : t("invalid");

    default:
      return undefined;
  }
}

/**
 * Points Zod at the active language: the built-in locale for anything not
 * worth a sentence of our own, and `plainMessage` for everything a form
 * actually shows.
 */
export function configureZodLocale(
  locale: AppLocale,
  t: ValidationTranslator,
): void {
  z.config(locale === "ar" ? z.locales.ar() : z.locales.en());
  z.config({ customError: (issue) => plainMessage(issue, t) });
}
