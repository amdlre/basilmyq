import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { storageStatus } from "@/server/uploads";

export const dynamic = "force-dynamic";

/**
 * Health check for Coolify.
 *
 * It verifies the database round-trip, not just that the process is up: a
 * container that cannot reach Postgres serves nothing useful, and an orchestrator
 * that only checks the port would keep routing traffic to it.
 *
 * `storage` is reported but never fails the check: uploads going missing is a
 * misconfigured volume, and restarting the container in a loop would not bring
 * the files back. It is here so the answer is one request away instead of a
 * hunt through broken images.
 */
export async function GET(): Promise<Response> {
  try {
    await db.$queryRaw`SELECT 1`;
    const storage = await storageStatus().catch(() => "unknown" as const);

    return NextResponse.json(
      { status: "ok", database: "up", storage },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "error", database: "down" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
