import { NextResponse } from "next/server";

import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Health check for Coolify.
 *
 * It verifies the database round-trip, not just that the process is up: a
 * container that cannot reach Postgres serves nothing useful, and an orchestrator
 * that only checks the port would keep routing traffic to it.
 */
export async function GET(): Promise<Response> {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "up" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "error", database: "down" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
