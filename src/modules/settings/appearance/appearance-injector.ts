import { COLOR_THEMES } from "@/constants/defaultAppearance";

/**
 * Appearance CSS generation (server-side).
 *
 * Colors are emitted SCOPED to a wrapper selector (e.g. `[data-appearance="public"]`)
 * so the public site and the admin dashboard can carry independent palettes while the
 * built-in globals.css theme remains the fallback (= the "restore default" target).
 *
 * A null/`default` color config returns an empty string → the scope inherits globals.css.
 */

export type ColorMode = "simple" | "themes" | "advanced" | "default";

export interface SixColors {
  accent: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  border: string;
}

export interface ColorConfig {
  mode: ColorMode;
  accentColor?: string;
  themePreset?: string;
  customPalette?: { light: SixColors; dark: SixColors } | null;
}

export interface FontConfig {
  type: "default" | "google" | "custom";
  name: string;
  weights: string[];
  customUrl?: string | null;
}

/* ------------------------------------------------------------------ colors */

/** Resolve a color config to a light+dark six-color palette, or null to fall back. */
function resolvePalette(
  config: ColorConfig | null | undefined
): { light: SixColors; dark: SixColors } | null {
  if (!config || config.mode === "default") return null;

  if (config.mode === "simple" && config.accentColor) {
    return paletteFromAccent(config.accentColor);
  }
  if (config.mode === "themes") {
    const theme = COLOR_THEMES[config.themePreset as keyof typeof COLOR_THEMES];
    // "default" preset === built-in design → fall back to globals.css.
    if (!theme || config.themePreset === "default") return null;
    return { light: theme.light, dark: theme.dark };
  }
  if (config.mode === "advanced" && config.customPalette) {
    return config.customPalette;
  }
  return null;
}

/** Expand a 6-color palette into the full shadcn token set (with derived foregrounds). */
function sixToTokens(c: SixColors): Record<string, string> {
  const fg = c.foreground;
  const bg = c.background;
  return {
    background: bg,
    "color-background": bg,
    foreground: fg,
    "color-foreground": fg,
    card: bg,
    "color-card": bg,
    "card-foreground": fg,
    "color-card-foreground": fg,
    popover: bg,
    "color-popover": bg,
    "popover-foreground": fg,
    "color-popover-foreground": fg,
    primary: c.primary,
    "color-primary": c.primary,
    "primary-foreground": contrast(c.primary),
    "color-primary-foreground": contrast(c.primary),
    secondary: c.secondary,
    "color-secondary": c.secondary,
    "secondary-foreground": contrast(c.secondary),
    "color-secondary-foreground": contrast(c.secondary),
    muted: c.secondary,
    "color-muted": c.secondary,
    "muted-foreground": mix(fg, bg, 0.45),
    "color-muted-foreground": mix(fg, bg, 0.45),
    // shadcn --accent is a subtle hover surface, NOT the brand color.
    accent: c.secondary,
    "color-accent": c.secondary,
    "accent-foreground": contrast(c.secondary),
    "color-accent-foreground": contrast(c.secondary),
    border: c.border,
    "color-border": c.border,
    input: c.border,
    "color-input": c.border,
    // focus ring carries the brand accent
    ring: c.accent,
    "color-ring": c.accent,
  };
}

const declare = (tokens: Record<string, string>) =>
  Object.entries(tokens)
    .map(([k, v]) => `--${k}:${v};`)
    .join("");

/**
 * Generate scoped color CSS.
 * @param scope CSS selector for the wrapper, e.g. `[data-appearance="public"]`
 */
export function generateColorCSS(
  scope: string,
  config: ColorConfig | null | undefined
): string {
  const palette = resolvePalette(config);
  if (!palette) return "";
  const light = declare(sixToTokens(palette.light));
  const dark = declare(sixToTokens(palette.dark));
  return `${scope}{${light}}.dark ${scope}{${dark}}`;
}

/**
 * Resolve a config to the full token map for one mode — used by the admin LIVE
 * PREVIEW. Never null: a default/empty config previews the built-in theme
 * (COLOR_THEMES.default, a hex approximation of the globals.css design).
 */
export function resolveTokens(
  config: ColorConfig | null | undefined,
  mode: "light" | "dark"
): Record<string, string> {
  const palette =
    resolvePalette(config) ?? {
      light: COLOR_THEMES.default.light,
      dark: COLOR_THEMES.default.dark,
    };
  return sixToTokens(palette[mode]);
}

/**
 * Just the @font-face / @import for a font (no `--font-app` assignment) so the
 * admin preview can render a font without restyling the whole dashboard.
 */
export function fontFaceCSS(font: FontConfig | null | undefined): string {
  if (!font) return "";
  if (font.type === "default") {
    if (!font.name || font.name === "Satoshi") return "";
    return localFontFaces(font);
  }
  if (font.type === "google") return googleImport(font);
  if (font.type === "custom" && font.customUrl) {
    return `@font-face{font-family:'${font.name}';src:url('${font.customUrl}') format('woff2');font-weight:100 900;font-display:swap;}`;
  }
  return "";
}

/** Simple mode: derive a full light/dark palette from a single brand color. */
function paletteFromAccent(accent: string): { light: SixColors; dark: SixColors } {
  return {
    light: {
      accent,
      primary: accent,
      secondary: lighten(accent, 0.94),
      background: "#ffffff",
      foreground: "#0a0a0a",
      border: lighten(accent, 0.88),
    },
    dark: {
      accent,
      primary: accent,
      secondary: darken(accent, 0.82),
      background: "#09090b", // Clean slate dark background
      foreground: "#fafafa",
      border: darken(accent, 0.74),
    },
  };
}

/* ------------------------------------------------------------------- fonts */

/**
 * Generate global font CSS. Returns "" for the built-in Satoshi default so the
 * next/font localFont (var --font-satoshi) keeps serving it with zero config.
 * Sets `--font-app`, which globals.css consumes with a Satoshi fallback.
 */
export function generateFontCSS(font: FontConfig | null | undefined): string {
  if (!font) return "";
  const isDefaultSatoshi =
    font.type === "default" && (!font.name || font.name === "Satoshi");
  if (isDefaultSatoshi) return "";

  let faces = "";
  if (font.type === "default") {
    faces = localFontFaces(font);
  } else if (font.type === "google") {
    faces = googleImport(font);
  } else if (font.type === "custom" && font.customUrl) {
    faces = `@font-face{font-family:'${font.name}';src:url('${font.customUrl}') format('woff2');font-weight:100 900;font-display:swap;}`;
  }
  return `${faces}:root{--font-app:'${font.name}';}`;
}

function localFontFaces(font: FontConfig): string {
  const id = font.name.toLowerCase().replace(/\s+/g, "");
  return (font.weights || ["400"])
    .map(
      (w) =>
        `@font-face{font-family:'${font.name}';src:url('/fonts/${id}/${id}-${w}.woff2') format('woff2');font-weight:${w};font-display:swap;}`
    )
    .join("");
}

function googleImport(font: FontConfig): string {
  const family = `${font.name.replace(/\s+/g, "+")}:wght@${(font.weights || ["400"]).join(";")}`;
  return `@import url('https://fonts.googleapis.com/css2?family=${family}&display=swap');`;
}

/* --------------------------------------------------------------- color math */

function normalize(hex: string): [number, number, number] {
  let h = (hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Relative luminance → choose a readable foreground (near-black or near-white). */
function contrast(hex: string): string {
  const [r, g, b] = normalize(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#fafafa";
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = normalize(a);
  const [r2, g2, b2] = normalize(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function lighten(hex: string, t: number): string {
  return mix(hex, "#ffffff", t);
}

function darken(hex: string, t: number): string {
  return mix(hex, "#000000", t);
}
