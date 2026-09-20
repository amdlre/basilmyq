/* eslint-disable no-console */
/**
 * Copies the local `uploads/` folder to a deployed site.
 *
 * Images live on disk next to the server, so a fresh deployment starts without
 * them even after the database is restored. This uploads each local file
 * through the dashboard's own upload route, then repoints every column that
 * referenced the old path at the new one.
 *
 * Usage (from the project root):
 *
 *   SITE_URL="https://basilmyq.com" \
 *   DATABASE_URL="postgresql://…"   \
 *   AUTH_SECRET="…" ADMIN_EMAIL="…" \
 *   npx tsx scripts/restore-uploads.ts
 *
 * It is safe to run more than once. Each file is matched by its original name,
 * so a re-run also repairs references left dangling by an earlier run — which
 * is what happens when a deployment restarts without a persistent volume
 * mounted at UPLOAD_DIR.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { SignJWT } from "jose";
import { Pool } from "pg";

const SITE_URL = requireEnv("SITE_URL").replace(/\/$/, "");
const DATABASE_URL = requireEnv("DATABASE_URL");
const AUTH_SECRET = requireEnv("AUTH_SECRET");
const ADMIN_EMAIL = requireEnv("ADMIN_EMAIL");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** Every column that can hold an uploaded image, as `[table, column]`. */
const IMAGE_COLUMNS: [table: string, column: string][] = [
  ["SiteSetting", "logoUrlAr"],
  ["SiteSetting", "logoUrlEn"],
  ["SiteSetting", "ogImageUrl"],
  ["SiteSetting", "faviconUrl"],
  ["HeroSection", "imageUrl"],
  ["AboutSection", "imageUrl"],
  ["Project", "coverUrl"],
  ["Post", "coverUrl"],
  ["Testimonial", "avatarUrl"],
  ["Experience", "logoUrl"],
  ["Education", "logoUrl"],
  // `Media` is deliberately absent: the upload route writes a fresh row for
  // every file, so the rows from the dump are deleted below instead of being
  // repointed — otherwise the library would list each image twice.
];

/** `Project.gallery` is a text array, so it needs its own statement. */
const ARRAY_COLUMNS: [table: string, column: string][] = [
  ["Project", "gallery"],
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/** The same session the dashboard issues, minted here for one upload run. */
async function signSession(): Promise<string> {
  return new SignJWT({ email: ADMIN_EMAIL })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("basilmyq")
    .setAudience("basilmyq-admin")
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(AUTH_SECRET));
}

async function upload(
  file: string,
  token: string,
): Promise<{ url: string } | { error: string }> {
  const extension = file.split(".").pop() ?? "";
  const type = MIME_BY_EXTENSION[extension.toLowerCase()];
  if (!type) return { error: `unsupported file type: .${extension}` };

  const body = new FormData();
  body.append(
    "file",
    new Blob([await readFile(path.join(UPLOAD_DIR, file))], { type }),
    file,
  );

  const response = await fetch(`${SITE_URL}/api/upload`, {
    method: "POST",
    headers: { cookie: `basilmyq_session=${token}` },
    body,
  });

  const result = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!response.ok || !result.url) {
    return { error: result.error ?? `HTTP ${response.status}` };
  }
  return { url: result.url };
}

async function main(): Promise<void> {
  const files = (await readdir(UPLOAD_DIR)).filter(
    (file) => !file.startsWith("."),
  );
  if (files.length === 0) {
    console.log("Nothing to upload: the local uploads folder is empty.");
    return;
  }

  const token = await signSession();
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    for (const file of files) {
      // Everything this file has ever been called: the local path from the
      // dump, plus the URL of every earlier upload of the same original file.
      const { rows } = await pool.query<{ url: string }>(
        `SELECT "url" FROM "Media" WHERE "filename" = $1`,
        [file],
      );
      const staleUrls = [
        `/uploads/${file}`,
        ...rows.map((row) => row.url),
      ].filter((url, index, all) => all.indexOf(url) === index);

      const result = await upload(file, token);

      if ("error" in result) {
        console.error(`✗ ${file}: ${result.error}`);
        continue;
      }

      const live = staleUrls.filter((url) => url !== result.url);

      let updated = 0;
      for (const [table, column] of IMAGE_COLUMNS) {
        const { rowCount } = await pool.query(
          `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = ANY($2::text[])`,
          [result.url, live],
        );
        updated += rowCount ?? 0;
      }
      for (const [table, column] of ARRAY_COLUMNS) {
        for (const stale of live) {
          const { rowCount } = await pool.query(
            `UPDATE "${table}" SET "${column}" = array_replace("${column}", $2, $1) WHERE $2 = ANY("${column}")`,
            [result.url, stale],
          );
          updated += rowCount ?? 0;
        }
      }

      // The upload route logs every file in the library, so the rows behind
      // the paths just replaced would otherwise linger as broken thumbnails.
      const { rowCount: removed } = await pool.query(
        `DELETE FROM "Media" WHERE "url" = ANY($1::text[])`,
        [live],
      );

      console.log(
        `✓ ${file} → ${result.url} (${updated} reference(s), ${removed ?? 0} stale row(s) removed)`,
      );
    }
  } finally {
    await pool.end();
  }

  console.log(
    "\nDone. Restart the site (or wait a minute) for the cached pages to pick the new URLs up.",
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
