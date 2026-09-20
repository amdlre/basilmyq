import { NextResponse } from "next/server";

import { readStoredFile } from "@/server/uploads";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Serves the CV and records the download.
 *
 * The file is streamed with `Content-Disposition: attachment` rather than
 * redirected to, for two reasons: a redirect to the PDF would open the
 * browser's viewer instead of saving the file, and going through this route is
 * what keeps the counter in Settings honest.
 */
export async function GET(request: Request): Promise<Response> {
  const settings = await db.siteSetting.findUnique({
    where: { id: "singleton" },
    select: { cvUrl: true, siteNameEn: true },
  });

  const cvUrl = settings?.cvUrl;
  if (!cvUrl) return new NextResponse(null, { status: 404 });

  const storedName = cvUrl.startsWith("/uploads/")
    ? cvUrl.slice("/uploads/".length)
    : null;

  // A CV pasted in as an external link is redirected to; only files this app
  // stores can be streamed from disk.
  if (!storedName) {
    await recordDownload();
    return NextResponse.redirect(new URL(cvUrl, new URL(request.url).origin));
  }

  const stored = await readStoredFile(storedName);
  if (!stored) return new NextResponse(null, { status: 404 });

  await recordDownload();

  const filename = `${(settings?.siteNameEn ?? "cv").replaceAll(/[^a-zA-Z0-9-]/g, "-")}-cv.pdf`;

  return new Response(new Uint8Array(stored.body), {
    headers: {
      "Content-Type": stored.type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(stored.body.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function recordDownload(): Promise<void> {
  await db.siteSetting
    .update({
      where: { id: "singleton" },
      data: { cvDownloadCount: { increment: 1 } },
    })
    // Counting must never break the download itself.
    .catch(() => undefined);
}
