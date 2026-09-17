export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://basilmyq.com";

export const SITE_DOMAIN = "basilmyq.com";

/** Session cookie name for the single-admin JWT (Phase 2). */
export const SESSION_COOKIE = "basilmyq_session";

/** JWT lifetime in seconds — 7 days. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
