import { Stack } from 'expo-router';

import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/theme/colors';

export default function AuthLayout() {
  // If an account already exists on this device, land on log-in;
  // otherwise start with sign-up.
  const hasAccount = useAuthStore((s) => s.account !== null);
  return (
    <Stack
      initialRouteName={hasAccount ? 'log-in' : 'sign-up'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="log-in" />
    </Stack>
  );
}
