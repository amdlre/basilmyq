import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { db } from "@/server/db";

/**
 * Local-disk storage for uploaded images.
 *
 * Files live outside `public/` because the standalone server only serves what
 * existed at build time. In Docker, mount a volume at `UPLOAD_DIR` or every
 * redeploy loses the library.
 */
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  // The ignore comment stops Turbopack tracing the whole project from here.
  path.join(/* turbopackIgnore: true */ process.cwd(), "uploads");

function storedPath(name: string): string {
  return path.join(/* turbopackIgnore: true */ UPLOAD_DIR, name);
}

/** The public path files are served from, by `app/uploads/[file]/route.ts`. */
export const UPLOAD_URL_PREFIX = "/uploads/";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** SVG is left out on purpose: it can carry script. */
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const TYPE_BY_EXTENSION = Object.fromEntries(
  Object.entries(EXTENSION_BY_TYPE).map(([type, ext]) => [ext, type]),
);

/** Names are generated here, so anything else is a traversal attempt. */
const STORED_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/;

export type UploadError = "INVALID_TYPE" | "TOO_LARGE";

export async function saveImage(
  file: File,
): Promise<{ url: string } | { error: UploadError }> {
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) return { error: "INVALID_TYPE" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "TOO_LARGE" };

  const buffer = Buffer.from(await file.arrayBuffer());

  // Reading the metadata also proves the bytes are really an image.
  const metadata = await sharp(buffer)
    .metadata()
    .catch(() => null);
  if (!metadata) return { error: "INVALID_TYPE" };

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(storedPath(filename), buffer);

  const url = `${UPLOAD_URL_PREFIX}${filename}`;
  await db.media.create({
    data: {
      url,
      filename: file.name || filename,
      mimeType: file.type,
      size: file.size,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    },
  });

  return { url };
}

export async function readStoredFile(
  name: string,
): Promise<{ body: Buffer; type: string } | null> {
  if (!STORED_NAME.test(name)) return null;

  const type = TYPE_BY_EXTENSION[name.split(".").pop() ?? ""];
  if (!type) return null;

  try {
    return { body: await readFile(storedPath(name)), type };
  } catch {
    return null;
  }
}

/** Removes the files behind library URLs; foreign URLs are ignored. */
export async function deleteStoredFiles(urls: string[]): Promise<void> {
  await Promise.all(
    urls
      .filter((url) => url.startsWith(UPLOAD_URL_PREFIX))
      .map((url) => url.slice(UPLOAD_URL_PREFIX.length))
      .filter((name) => STORED_NAME.test(name))
      .map((name) => unlink(storedPath(name)).catch(() => {})),
  );
}
