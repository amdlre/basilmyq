import "server-only";

import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
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

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  // SVG is accepted, but it is markup rather than pixels: it can carry script
  // and, served from our own origin, that script would run as us. Two layers
  // answer that — `rejectsAsUnsafe` below refuses anything executable at the
  // door, and `app/uploads/[file]` serves it under a CSP that would stop the
  // script even if something slipped past. Neither is load-bearing alone.
  "image/svg+xml": "svg",
};

const TYPE_BY_EXTENSION: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(EXTENSION_BY_TYPE).map(([type, ext]) => [ext, type]),
  ),
  pdf: "application/pdf",
};

/** Names are generated here, so anything else is a traversal attempt. */
const STORED_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif|avif|svg|pdf)$/;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/** `%PDF-` — checked against the bytes, not the declared content type. */
const PDF_MAGIC = Buffer.from("%PDF-");

export type UploadError = "INVALID_TYPE" | "TOO_LARGE" | "UNSAFE_SVG";

/**
 * Everything an image has no business containing. This refuses rather than
 * strips: a logo never holds any of it, so a file that does is either hostile
 * or broken, and refusing cannot leave a half-cleaned payload behind the way a
 * sanitiser that missed one vector would.
 */
const UNSAFE_SVG_PATTERNS: readonly RegExp[] = [
  /<\s*script/i,
  /<\s*foreignObject/i,
  /<\s*(iframe|embed|object|audio|video)/i,
  // Inline handlers: onload=, onclick=, and the rest.
  /\son[a-z]+\s*=/i,
  /javascript\s*:/i,
  // Declared entities are how XML files are made to read other files.
  /<!ENTITY/i,
  // A reference that leaves the document: tracking, or worse.
  /(?:xlink:)?href\s*=\s*["']\s*(?:https?:)?\/\//i,
  /data:text\/html/i,
];

function rejectsAsUnsafe(buffer: Buffer): boolean {
  const markup = buffer.toString("utf8");
  return UNSAFE_SVG_PATTERNS.some((pattern) => pattern.test(markup));
}

export async function saveImage(
  file: File,
): Promise<{ url: string } | { error: UploadError }> {
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) return { error: "INVALID_TYPE" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "TOO_LARGE" };

  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "svg" && rejectsAsUnsafe(buffer)) {
    return { error: "UNSAFE_SVG" };
  }

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

/**
 * Stores a PDF, currently only used for the CV.
 *
 * The magic bytes are checked rather than the browser-supplied content type,
 * which a client controls freely. Only PDF is accepted: it is the one document
 * format every browser and phone can open without downloading an app.
 */
export async function saveDocument(
  file: File,
): Promise<{ url: string } | { error: UploadError }> {
  if (file.type !== "application/pdf") return { error: "INVALID_TYPE" };
  if (file.size > MAX_DOCUMENT_BYTES) return { error: "TOO_LARGE" };

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
    return { error: "INVALID_TYPE" };
  }

  const filename = `${randomUUID()}.pdf`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(storedPath(filename), buffer);

  const url = `${UPLOAD_URL_PREFIX}${filename}`;
  await db.media.create({
    data: {
      url,
      filename: file.name || filename,
      mimeType: "application/pdf",
      size: file.size,
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

/**
 * Whether the uploads directory still holds what the database points at.
 *
 * `UPLOAD_DIR` has to be a volume that outlives the container. Without one the
 * rows survive every redeploy — Postgres is its own service — while the files
 * do not, and the site quietly fills with broken images that nothing in the
 * logs complains about. Checking the oldest upload catches that within one
 * deploy: it is the first file a lost volume takes with it.
 */
export async function storageStatus(): Promise<
  "ok" | "empty" | "missing-files"
> {
  const oldest = await db.media.findFirst({
    orderBy: { createdAt: "asc" },
    select: { url: true },
  });
  if (!oldest) return "empty";

  const name = oldest.url.slice(UPLOAD_URL_PREFIX.length);
  if (!STORED_NAME.test(name)) return "missing-files";

  try {
    await access(storedPath(name));
    return "ok";
  } catch {
    return "missing-files";
  }
}
