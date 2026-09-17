import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "./get-session";
import { type Session } from "./session";

/**
 * The data-layer guard. Every admin Server Action and every dashboard data
 * query starts here — the proxy's redirect is a convenience, not the defence.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
