import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/get-session";
import { saveDocument, saveImage } from "@/server/uploads";

/**
 * Receives one file from the dashboard's upload fields.
 *
 * A route handler rather than a Server Action because actions cap the request
 * body at 1 MB, well under a typical cover image or CV.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await getSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  }

  // `kind` decides which validator runs; anything unrecognised is an image,
  // so an unexpected value can never widen what is accepted.
  const result =
    form?.get("kind") === "document"
      ? await saveDocument(file)
      : await saveImage(file);

  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
