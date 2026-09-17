import { type NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Next.js 16 renamed the `middleware` convention to `proxy`, and it now runs on
 * the Node.js runtime — so secrets are read at request time rather than being
 * inlined at build time, which matters for the Coolify deployment.
 *
 * The session check here is a convenience redirect. It is NOT the security
 * boundary: `requireAuth()` re-verifies in the data layer on every admin read
 * and every admin Server Action.
 */
const handleI18nRouting = createMiddleware(routing);

type RouteInfo = {
  locale: string;
  pathname: string;
};

function stripLocale(pathname: string): RouteInfo {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (hasLocale(routing.locales, maybeLocale)) {
    return {
      locale: maybeLocale,
      pathname: `/${segments.slice(2).join("/")}`,
    };
  }

  return { locale: routing.defaultLocale, pathname };
}

export default async function proxy(request: NextRequest) {
  const { locale, pathname } = stripLocale(request.nextUrl.pathname);

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isDashboard || isLogin) {
    const session = await verifySession(
      request.cookies.get(SESSION_COOKIE)?.value,
    );

    if (isDashboard && !session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isLogin && session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/dashboard`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    // Skip Next internals, the API surface and anything with a file extension.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
