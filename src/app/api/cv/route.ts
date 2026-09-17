import { NextResponse } from "next/server";

import { db } from "@/server/db";

/**
 * Redirects to the CV file and records the download.
 *
 * A route handler rather than a direct link, so the counter in Settings → CV
 * reflects real downloads. `?locale=` picks the Arabic or English file.
 */
export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const locale = requestUrl.searchParams.get("locale");

  const settings = await db.siteSetting.findUnique({
    where: { id: "singleton" },
    select: { cvUrlAr: true, cvUrlEn: true },
  });

  const target =
    locale === "en"
      ? (settings?.cvUrlEn ?? settings?.cvUrlAr)
      : (settings?.cvUrlAr ?? settings?.cvUrlEn);

  if (!target) {
    return new NextResponse(null, { status: 404 });
  }

  await db.siteSetting.update({
    where: { id: "singleton" },
    data: { cvDownloadCount: { increment: 1 } },
  });

  return NextResponse.redirect(new URL(target, requestUrl.origin));
}
