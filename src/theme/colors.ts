/**
 * Pocket color palette — extracted from design-reference.html.
 * Every value here appears verbatim in the design export; do not "improve" them.
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
