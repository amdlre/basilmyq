"use server";

import { cookies, headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

// next-intl's redirect keeps the locale prefix on the target route.
import { redirect } from "@/i18n/navigation";

import { signSession } from "@/lib/auth/session";
import { verifyCredentials } from "@/lib/auth/verify-credentials";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  pruneLoginRateLimits,
  recordFailedLogin,
} from "@/lib/auth/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = {
  error?: string;
};

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? "unknown"
  );
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const t = await getTranslations("Login");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Never say which field was wrong.
  if (!parsed.success) {
    return { error: t("invalidCredentials") };
  }

  pruneLoginRateLimits();
  const ip = await getClientIp();
  const limit = checkLoginRateLimit(ip);

  if (!limit.allowed) {
    return {
      error: t("tooManyAttempts", {
        minutes: Math.ceil(limit.retryAfterSeconds / 60),
      }),
    };
  }

  const isValid = await verifyCredentials(
    parsed.data.email,
    parsed.data.password,
  );

  if (!isValid) {
    recordFailedLogin(ip);
    return { error: t("invalidCredentials") };
  }

  clearLoginRateLimit(ip);

  const token = await signSession(parsed.data.email);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  const locale = await getLocale();
  redirect({ href: "/dashboard", locale });
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);

  const locale = await getLocale();
  redirect({ href: "/login", locale });
}
