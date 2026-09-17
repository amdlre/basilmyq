import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * Locale negotiation lives here; dashboard auth guards are layered in Phase 2.
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip Next internals, the API surface and anything with a file extension.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
