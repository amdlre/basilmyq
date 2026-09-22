import { readStoredFile } from "@/server/uploads";

/**
 * An SVG opened directly is a document on our own origin, not a picture, so a
 * script inside one would run with our cookies. This locks it down to drawing
 * itself: no script, no network, no navigation, nothing it can reach. Upload
 * refuses anything executable already — this is what holds if that check is
 * ever outrun.
 */
const SVG_SANDBOX =
  "default-src 'none'; style-src 'unsafe-inline'; sandbox; frame-ancestors 'none'";

/** Serves uploaded images. Names are random and never reused, so they cache forever. */
export async function GET(
  _request: Request,
  props: RouteContext<"/uploads/[file]">,
): Promise<Response> {
  const { file } = await props.params;
  const stored = await readStoredFile(file);

  if (!stored) return new Response(null, { status: 404 });

  const headers = new Headers({
    "Content-Type": stored.type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });

  if (stored.type === "image/svg+xml") {
    headers.set("Content-Security-Policy", SVG_SANDBOX);
  }

  return new Response(new Uint8Array(stored.body), { headers });
}
