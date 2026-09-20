/**
 * Turns the accent colour stored in Settings into a CSS override.
 *
 * The brand accent is `--primary`, which the design system uses both as a fill
 * (with `--primary-foreground` written on it) and as a tint. A colour picked in
 * the dashboard therefore cannot just be dropped into `--primary`: a mid-tone
 * accent needs dark text on it, a dark accent needs white, and a dark accent
 * also has to be lightened before it reads against the dark theme's background.
 * All of that is computed here rather than left to whoever picks the colour.
 */

type Oklch = { l: number; c: number; h: number };

/**
 * Which text colour sits on the accent. `auto` picks whichever of the two
 * reads better; the other two are a deliberate choice, and are honoured even
 * when the contrast is lower — a brand decision is allowed to win, but the
 * dashboard says what the measured ratio is.
 */
export type AccentForeground = "auto" | "light" | "dark";

const TEXT_LIGHT: Oklch = { l: 0.985, c: 0, h: 0 };
const TEXT_DARK: Oklch = { l: 0.145, c: 0, h: 0 };

/** Background lightness of each theme, matching the tokens in `globals.css`. */
const LIGHT_BG_L = 1;
const DARK_BG_L = 0.145;

/** Minimum lightness an accent needs to carry text on the dark theme. */
const DARK_THEME_MIN_L = 0.62;

function parseOklch(value: string): Oklch | null {
  const match = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i.exec(
    value.trim(),
  );
  if (!match) return null;

  const [, rawL, rawC, rawH] = match;
  if (!rawL || !rawC || !rawH) return null;

  const l = rawL.endsWith("%")
    ? Number.parseFloat(rawL) / 100
    : Number.parseFloat(rawL);
  return { l, c: Number.parseFloat(rawC), h: Number.parseFloat(rawH) };
}

function parseHex(value: string): Oklch | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!match?.[1]) return null;

  const int = Number.parseInt(match[1], 16);
  const toLinear = (channel: number): number =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

  const r = toLinear(((int >> 16) & 255) / 255);
  const g = toLinear(((int >> 8) & 255) / 255);
  const b = toLinear((int & 255) / 255);

  const lCone = Math.cbrt(
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
  );
  const mCone = Math.cbrt(
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
  );
  const sCone = Math.cbrt(
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  );

  const lab = {
    l: 0.2104542553 * lCone + 0.793617785 * mCone - 0.0040720468 * sCone,
    a: 1.9779984951 * lCone - 2.428592205 * mCone + 0.4505937099 * sCone,
    b: 0.0259040371 * lCone + 0.7827717662 * mCone - 0.808675766 * sCone,
  };

  const hue = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  return {
    l: lab.l,
    c: Math.hypot(lab.a, lab.b),
    h: hue < 0 ? hue + 360 : hue,
  };
}

/** Linear-light sRGB, which is what the WCAG luminance formula expects. */
function toLinearRgb({ l, c, h }: Oklch): [number, number, number] {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);

  const lCone = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCone = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  ];
}

function luminance(colour: Oklch): number {
  const [r, g, b] = toLinearRgb(colour);
  const clamp = (value: number): number => Math.max(0, Math.min(1, value));
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b);
}

function contrast(a: Oklch, b: Oklch): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

const format = ({ l, c, h }: Oklch): string =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(2)})`;

function foregroundFor(fill: Oklch, choice: AccentForeground): Oklch {
  if (choice === "light") return TEXT_LIGHT;
  if (choice === "dark") return TEXT_DARK;
  return contrast(TEXT_LIGHT, fill) >= contrast(TEXT_DARK, fill)
    ? TEXT_LIGHT
    : TEXT_DARK;
}

export type AccentTokens = {
  light: { primary: string; foreground: string };
  dark: { primary: string; foreground: string };
  /** Contrast of the accent against each theme's page background. */
  contrast: { onLight: number; onDark: number };
  /** Contrast of the chosen text colour on the accent, per theme. */
  textContrast: { onLight: number; onDark: number };
};

export function buildAccentTokens(
  value: string,
  choice: AccentForeground = "auto",
): AccentTokens | null {
  const base = parseOklch(value) ?? parseHex(value);
  if (!base || !Number.isFinite(base.l)) return null;

  // A dark accent disappears against the dark theme, so it is lifted there —
  // the hue and chroma are kept, only the lightness moves.
  const darkAccent: Oklch =
    base.l < DARK_THEME_MIN_L ? { ...base, l: DARK_THEME_MIN_L } : base;

  const lightText = foregroundFor(base, choice);
  const darkText = foregroundFor(darkAccent, choice);

  return {
    light: { primary: format(base), foreground: format(lightText) },
    dark: { primary: format(darkAccent), foreground: format(darkText) },
    contrast: {
      onLight: contrast(base, { l: LIGHT_BG_L, c: 0, h: 0 }),
      onDark: contrast(darkAccent, { l: DARK_BG_L, c: 0, h: 0 }),
    },
    textContrast: {
      onLight: contrast(lightText, base),
      onDark: contrast(darkText, darkAccent),
    },
  };
}

/**
 * The style block injected into the document head. Returns null for the default
 * accent or an unparseable value, in which case `globals.css` stands unchanged.
 */
export function accentStyleSheet(
  value: string | null | undefined,
  choice: AccentForeground = "auto",
): string | null {
  if (!value) return null;

  const tokens = buildAccentTokens(value, choice);
  if (!tokens) return null;

  return `:root{--primary:${tokens.light.primary};--primary-foreground:${tokens.light.foreground};--ring:${tokens.light.primary};--sidebar-primary:${tokens.light.primary};--sidebar-primary-foreground:${tokens.light.foreground};--sidebar-ring:${tokens.light.primary}}.dark{--primary:${tokens.dark.primary};--primary-foreground:${tokens.dark.foreground};--ring:${tokens.dark.primary};--sidebar-primary:${tokens.dark.primary};--sidebar-primary-foreground:${tokens.dark.foreground};--sidebar-ring:${tokens.dark.primary}}`;
}
