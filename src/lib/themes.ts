/**
 * Editorial theme system — monochrome base + ONE accent.
 * Hierarchy comes from type and space, color is used sparingly.
 * All values are raw CSS colors so we can drive them via CSS variables.
 */
export type Theme = {
  id: string;
  name: string;
  bg: string; // page background
  fg: string; // primary text
  muted: string; // secondary text
  line: string; // hairline dividers / borders
  accent: string; // the single accent
  accentFg: string; // text color when sitting on the accent
  grain: number; // grain opacity 0..1
};

export const THEMES: Record<string, Theme> = {
  noir: {
    id: "noir",
    name: "Noir",
    bg: "#0b0b0c",
    fg: "#f5f3ee",
    muted: "#8a8880",
    line: "rgba(245,243,238,0.14)",
    accent: "#e8e4d8",
    accentFg: "#0b0b0c",
    grain: 0.05,
  },
  ivory: {
    id: "ivory",
    name: "Ivory",
    bg: "#f3f1ea",
    fg: "#16150f",
    muted: "#6b685c",
    line: "rgba(22,21,15,0.14)",
    accent: "#16150f",
    accentFg: "#f3f1ea",
    grain: 0.04,
  },
  ember: {
    id: "ember",
    name: "Ember",
    bg: "#0c0a09",
    fg: "#f7efe6",
    muted: "#8a7f73",
    line: "rgba(247,239,230,0.14)",
    accent: "#ff5a1f",
    accentFg: "#0c0a09",
    grain: 0.05,
  },
  plum: {
    id: "plum",
    name: "Plum",
    bg: "#120d16",
    fg: "#f1e9f2",
    muted: "#8f8294",
    line: "rgba(241,233,242,0.14)",
    accent: "#c084fc",
    accentFg: "#120d16",
    grain: 0.05,
  },
  forest: {
    id: "forest",
    name: "Forest",
    bg: "#0a0f0c",
    fg: "#eaf1ec",
    muted: "#7f8f85",
    line: "rgba(234,241,236,0.14)",
    accent: "#4ade80",
    accentFg: "#0a0f0c",
    grain: 0.05,
  },
  cobalt: {
    id: "cobalt",
    name: "Cobalt",
    bg: "#080b14",
    fg: "#e9edf7",
    muted: "#7b8296",
    line: "rgba(233,237,247,0.14)",
    accent: "#5b8cff",
    accentFg: "#080b14",
    grain: 0.05,
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES.noir;
}

/** Inline CSS custom properties for a theme, for use as a style object. */
export function themeVars(id: string): React.CSSProperties {
  const t = getTheme(id);
  return {
    ["--bg" as string]: t.bg,
    ["--fg" as string]: t.fg,
    ["--muted" as string]: t.muted,
    ["--line" as string]: t.line,
    ["--accent" as string]: t.accent,
    ["--accent-fg" as string]: t.accentFg,
    ["--grain" as string]: String(t.grain),
  };
}
