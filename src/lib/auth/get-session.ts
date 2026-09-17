import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/constants";

import { type Session, verifySession } from "./session";

/**
 * Reads and verifies the session for the current request. `cache()` keeps it to
 * a single verification per render pass, however many components ask.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
});
