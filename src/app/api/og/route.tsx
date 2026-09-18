import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import { LOCALES } from "@/i18n/routing";

/**
 * Open Graph image for shared links.
 *
 * The Arabic font is read from disk rather than fetched, so a share preview
 * never depends on a third-party request. Cached across requests because the
 * file never changes within a deployment.
 */
const ARABIC = /[\u0600-\u06FF]/;

/**
 * Satori shapes Arabic letters correctly but has no bidi algorithm: it lays word
 * runs out in logical order, so an Arabic title comes out with its words
 * reversed on screen. Reversing the tokens here is what a bidi pass would do to
 * a single right-to-left paragraph, and it keeps mixed titles like
 * "منصة Next.js" in the right visual order too.
 */
function forSatori(text: string, locale: string): string {
  if (locale !== "ar" || !ARABIC.test(text)) return text;
  return text.split(/\s+/).reverse().join(" ");
}

let fontCache: Buffer | undefined;

async function loadFont(): Promise<Buffer> {
  fontCache ??= await readFile(
    path.join(process.cwd(), "src/assets/fonts/ibm-plex-sans-arabic-600.ttf"),
  );
  return fontCache;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const rawTitle = (searchParams.get("title") ?? "basilmyq").slice(0, 120);
  const rawEyebrow =
    searchParams.get("eyebrow")?.slice(0, 60) ?? "basilmyq.com";
  const rawLocale = searchParams.get("locale");
  const locale = LOCALES.includes(rawLocale as (typeof LOCALES)[number])
    ? (rawLocale as (typeof LOCALES)[number])
    : "ar";

  const title = forSatori(rawTitle, locale);
  const eyebrow = forSatori(rawEyebrow, locale);
  const font = await loadFont();

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Plex",
        textAlign: locale === "ar" ? "right" : "left",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#a1a1aa",
          justifyContent: locale === "ar" ? "flex-end" : "flex-start",
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: rawTitle.length > 60 ? 56 : 72,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          justifyContent: locale === "ar" ? "flex-end" : "flex-start",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: locale === "ar" ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            width: 44,
            height: 6,
            borderRadius: 999,
            background: "#4f46e5",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
          basilmyq.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Plex",
          data: new Uint8Array(font).buffer as ArrayBuffer,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );

  // The route reads query parameters, so it cannot be statically generated.
  // Long-lived caching gives the same effect: a given title renders once and is
  // then served from the CDN.
  image.headers.set(
    "cache-control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );

  return image;
}
