import { TextStyle } from 'react-native';

/**
 * Nunito font family names as registered by @expo-google-fonts/nunito.
 * React Native picks weight by family name, not fontWeight, so each
 * design weight maps to its own family string.
 */
export const fonts = {
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

/** Text styles used across the design reference (font: <weight> <size> Nunito). */
export const type = {
  /** 900 40px — home balance figure */
  balance: { fontFamily: fonts.black, fontSize: 40, letterSpacing: -0.5 },
  /** 900 38px — budget monthly available */
  bigFigure: { fontFamily: fonts.black, fontSize: 38, letterSpacing: -0.5 },
  /** 900 46px — add screen amount */
  addAmount: { fontFamily: fonts.black, fontSize: 46, letterSpacing: -1 },
  /** 900 33px — weekly spent */
  weeklyFigure: { fontFamily: fonts.black, fontSize: 33, letterSpacing: -0.5 },
  /** 900 30px — daily ring center */
  ringFigure: { fontFamily: fonts.black, fontSize: 30, letterSpacing: -0.5 },
  /** 800 22px — home greeting name */
  greeting: { fontFamily: fonts.extraBold, fontSize: 22 },
  /** 800 21px — screen titles */
  screenTitle: { fontFamily: fonts.extraBold, fontSize: 21 },
  /** 800 16px — section headings */
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 16 },
  /** 800 15px — subsection headings, row amounts */
  subsectionTitle: { fontFamily: fonts.extraBold, fontSize: 15 },
  /** 800 14px — buttons, stat values */
  statValue: { fontFamily: fonts.extraBold, fontSize: 14 },
  /** 700 14px — list row titles */
  rowTitle: { fontFamily: fonts.bold, fontSize: 14 },
  /** 700 13px — card labels */
  cardLabel: { fontFamily: fonts.bold, fontSize: 13 },
  /** 700 12px — small labels */
  smallLabel: { fontFamily: fonts.bold, fontSize: 12 },
  /** 700 11px — tiny labels */
  tinyLabel: { fontFamily: fonts.bold, fontSize: 11 },
  /** 600 12px — row subtitles */
  rowSubtitle: { fontFamily: fonts.semiBold, fontSize: 12 },
} satisfies Record<string, TextStyle>;
