/* eslint-disable no-console */
import { readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import { config as loadEnv } from "dotenv";

import { createPrismaClient } from "../src/server/prisma-client";

// Runs outside Next.js, so load the same env file the app uses.
loadEnv({ path: ".env.local", override: true, quiet: true });

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const UPLOAD_URL_PREFIX = "/uploads/";

/**
 * Copies files that are still on disk into their `Media` row.
 *
 * Needed once, for uploads made before the bytes moved into the database.
 * Anything whose disk copy is already gone cannot be recovered and is listed
 * at the end so it can be uploaded again.
 */
async function main() {
  const db = createPrismaClient();

  const rows = await db.media.findMany({
    where: { data: null },
    select: { id: true, url: true, filename: true },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length === 0) {
    console.log("Every media row already carries its file. Nothing to do.");
    await db.$disconnect();
    return;
  }

  console.log(`${rows.length} row(s) without a stored file.\n`);

  const missing: string[] = [];
  let restored = 0;
  let bytes = 0;

  for (const row of rows) {
    const name = row.url.startsWith(UPLOAD_URL_PREFIX)
      ? row.url.slice(UPLOAD_URL_PREFIX.length)
      : null;

    const body = name
      ? await readFile(path.join(UPLOAD_DIR, name)).catch(() => null)
      : null;

    if (!body) {
      missing.push(`${row.filename}  (${row.url})`);
      continue;
    }

    await db.media.update({ where: { id: row.id }, data: { data: body } });
    restored += 1;
    bytes += body.byteLength;
    console.log(
      `  stored  ${row.filename}  ${(body.byteLength / 1024).toFixed(1)} KB`,
    );
  }

  console.log(
    `\nStored ${restored} file(s), ${(bytes / 1024 / 1024).toFixed(2)} MB.`,
  );

  if (missing.length > 0) {
    console.log(
      `\n${missing.length} file(s) are gone from disk and cannot be recovered.`,
    );
    console.log("Upload them again, then delete the stale rows in Media:\n");
    for (const line of missing) console.log(`  ${line}`);
  }

  await db.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
