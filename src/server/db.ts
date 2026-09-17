import type { PrismaClient } from "@/generated/prisma/client";

import { createPrismaClient } from "./prisma-client";

/**
 * Prisma singleton. Next.js clears the module registry on every HMR pass, so
 * without this the dev server would open a new connection pool per reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
