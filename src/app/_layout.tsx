import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';

import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useColors, useScheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const session = useAuthStore((s) => s.session);
  const colors = useColors();
  const scheme = useScheme();
  const themeMode = useFinanceStore((s) => s.settings.themeMode);

  const ready = fontsLoaded && hasHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Push the in-app theme choice down to the OS (overrideUserInterfaceStyle):
  // native chrome — the system tab bar, Liquid Glass, alerts, keyboards —
  // follows the phone's appearance otherwise, which made the native tab
  // container flash white and the glass bar ignore the in-app toggle.
  useEffect(() => {
    Appearance.setColorScheme?.(themeMode === 'system' ? null : themeMode);
  }, [themeMode]);

  // Navigators paint their own background between screens; without a matching
  // theme the defaults (white) flash through on every transition in dark mode.
  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.green,
        background: colors.background,
        card: colors.background,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  // The native root view also shows through for a frame on screen changes.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if (!ready) return null;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Protected guard={!hasOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={hasOnboarded && !session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={hasOnboarded && session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-bill" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-debt" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-wish" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="account" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
