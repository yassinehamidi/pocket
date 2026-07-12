/**
 * Pocket color palette — extracted from design-reference.html.
 * Every value here appears verbatim in the design export; do not "improve" them.
 * `darkColors` is the derived dark-mode counterpart (same brand hues on dark
 * surfaces) — the design reference is light-only, so these are the only
 * values not taken from it. Components should read colors via the hooks in
 * theme/useTheme.ts, never import a palette directly.
 */
export const colors = {
  // Surfaces
  background: '#f6f4ef',
  card: '#ffffff',
  frame: '#14261d',

  // Text
  textPrimary: '#1d241f',
  textSecondary: '#4a554d',
  textBody: '#6b7670',
  textMuted: '#9aa79c',

  // Brand greens
  green: '#1f9d5a',
  greenDark: '#17784a',
  greenGradient: ['#22a860', '#158a4c', '#0f7a43'] as const,
  greenBgSoft: '#e8f5ec',
  greenIconTileBg: '#f0f3ee',
  greenIconTileFg: '#3f7a58',
  greenBarInactive: '#cfe6d8',

  // Expense reds
  red: '#e0674f',
  redDark: '#c85a45',
  redBgSoft: '#fbecec',

  // Savings blue
  blue: '#2f6fb0',
  blueBgSoft: '#eef4fb',

  // Borders & tracks
  border: '#efeee9',
  borderStrong: '#eceae4',
  borderChip: '#ecebe6',
  divider: '#f1f0eb',
  track: '#eef1ea',
  trackRing: '#e6ece5',
  dashedBorder: '#d8ddd4',
  segmentBg: '#eceae4',
  moodMuted: '#7a857c',

  white: '#ffffff',
} as const;

export type Palette = { [K in keyof typeof colors]: (typeof colors)[K] extends string ? string : (typeof colors)[K] };

export const darkColors: Palette = {
  // Surfaces
  background: '#121511',
  card: '#1c211c',
  frame: '#14261d',

  // Text
  textPrimary: '#eef2ec',
  textSecondary: '#c3ccc4',
  textBody: '#9aa69d',
  textMuted: '#6f7b72',

  // Brand greens (brightened for dark surfaces)
  green: '#33bd77',
  greenDark: '#5fd699',
  greenGradient: ['#22a860', '#158a4c', '#0f7a43'] as const,
  greenBgSoft: '#1c2f23',
  greenIconTileBg: '#232823',
  greenIconTileFg: '#8fbf9f',
  greenBarInactive: '#2c4636',

  // Expense reds
  red: '#ef8168',
  redDark: '#f2937e',
  redBgSoft: '#342220',

  // Savings blue
  blue: '#6fa8dc',
  blueBgSoft: '#1c2733',

  // Borders & tracks
  border: '#262b25',
  borderStrong: '#2d332c',
  borderChip: '#2c312b',
  divider: '#242923',
  track: '#252a24',
  trackRing: '#2a2f29',
  dashedBorder: '#3a4038',
  segmentBg: '#272c26',
  moodMuted: '#8b968d',

  white: '#ffffff',
};
