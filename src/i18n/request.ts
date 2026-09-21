import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Pinned per request so `format.relativeTime` produces the same string on
    // the server and on the client. Left unset, each side reads its own clock
    // and "3 days ago" can hydrate into something slightly different.
    now: new Date(),
  };
});
