import { readStoredFile } from "@/server/uploads";

/** Serves uploaded images. Names are random and never reused, so they cache forever. */
export async function GET(
  _request: Request,
  props: RouteContext<"/uploads/[file]">,
): Promise<Response> {
  const { file } = await props.params;
  const stored = await readStoredFile(file);

  if (!stored) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(stored.body), {
    headers: {
      "Content-Type": stored.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
