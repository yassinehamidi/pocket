import { useColorScheme } from 'react-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { colors as lightColors, darkColors, Palette } from '@/theme/colors';

export type Scheme = 'light' | 'dark';

/** The active color scheme: the Appearance setting, following the phone on "system". */
export function useScheme(): Scheme {
  const system = useColorScheme();
  const mode = useFinanceStore((s) => s.settings.themeMode);
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}

/** The active palette. Subscribe with this instead of importing a palette. */
export function useColors(): Palette {
  return useScheme() === 'dark' ? darkColors : lightColors;
}

/**
 * Wraps a StyleSheet factory so styles follow the active scheme:
 *   const useStyles = themedStyles((colors) => StyleSheet.create({ ... }));
 *   ...
 *   const styles = useStyles(); // inside the component
 * Each scheme's sheet is created once and cached.
 */
export function themedStyles<T>(factory: (c: Palette) => T): () => T {
  const cache: { light?: T; dark?: T } = {};
  return function useStyles(): T {
    const scheme = useScheme();
    if (!cache[scheme]) cache[scheme] = factory(scheme === 'dark' ? darkColors : lightColors);
    return cache[scheme]!;
  };
}
