/**
 * A tiny neutral blur placeholder.
 *
 * Uploaded images have no stored blurDataURL yet, so generating one per image
 * would mean decoding every file on render. A single low-contrast SVG gives the
 * same perceived benefit — no layout flash, no jarring pop-in — at zero cost,
 * and it reads correctly in both themes.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5">
      <filter id="b"><feGaussianBlur stdDeviation="1"/></filter>
      <rect width="8" height="5" fill="#8a8a8a" filter="url(#b)" opacity="0.35"/>
    </svg>`,
  ).toString("base64");
