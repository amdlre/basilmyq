import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * Shared by the locale layout and `global-not-found`, which bypasses that
 * layout entirely and has to set the document up for itself.
 */

export const fontLatin = Geist({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  // Only the dashboard's markdown editor uses it, so it is fetched on demand
  // rather than preloaded on every page.
  preload: false,
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  // Two weights, not five: each extra weight is another ~35 KB preloaded on
  // every page, and the design only ever uses body and semibold.
  weight: ["400", "600"],
  variable: "--font-arabic",
  display: "swap",
});

/** Every font variable the design system reads, for the `<html>` class. */
export const FONT_VARIABLES = `${fontLatin.variable} ${fontMono.variable} ${fontArabic.variable}`;
