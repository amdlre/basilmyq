import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a bundled engine.
 * Built here once so the app and the seed script share identical configuration.
 */
export function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    // `next build` imports every route to collect its configuration, and the
    // Docker build has no database. Constructing the client never connects —
    // the pool only dials on the first query — so an unreachable placeholder
    // is safe here. Nothing may query during the build (see `force-dynamic`
    // on the public layout).
    (process.env.NEXT_PHASE === "phase-production-build"
      ? "postgresql://build:build@127.0.0.1:1/build"
      : undefined);

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}
