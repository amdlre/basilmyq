import "server-only";

import { getTranslations } from "next-intl/server";
import type { z } from "zod";

import { plainMessage } from "@/lib/validations/configure-zod";

/**
 * The server runs the same schemas as the form, so it can raise the same
 * issues — but Zod's error map is module-global and a server action serves
 * every locale at once, so the messages are translated here per request
 * instead of being configured into Zod.
 */
export async function fieldErrorsFrom(
  issues: readonly z.core.$ZodIssue[],
): Promise<Record<string, string>> {
  const t = await getTranslations("Validation");
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (!key || errors[key]) continue;
    errors[key] = plainMessage(issue, t) ?? issue.message;
  }

  return errors;
}
