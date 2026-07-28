import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, View } from 'react-native';

import { AddFab } from '@/components/AddFab';
import { TabBar } from '@/components/TabBar';
import { useColors } from '@/theme/useTheme';

// The native system tab bar pulls in native code that isn't bundled inside
// the precompiled Expo Go client — only in a real dev-client/standalone
// build. Fall back to the JS TabBar there so the app still renders instead
// of crashing on an unlinked native module.
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function TabsLayout() {
  const colors = useColors();

  // iOS gets the real system tab bar (UITabBarController) — on iOS 26 that's
  // the genuine Liquid Glass bar with morphing, scroll-edge effects, and
  // minimize-on-scroll. The "+" lives in a detached floating glass circle
  // (native bars have no FAB slot; this is the iOS 26 pattern for it).
  if (Platform.OS === 'ios' && !inExpoGo) {
    return (
      <View style={{ flex: 1 }}>
        <NativeTabs tintColor={colors.green} minimizeBehavior="onScrollDown">
          <NativeTabs.Trigger name="index">
            <Icon sf="house.fill" />
            <Label>Home</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="history">
            <Icon sf="clock.arrow.circlepath" />
            <Label>History</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="goals">
            <Icon sf="target" />
            <Label>Goals</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="budget">
            <Icon sf="wallet.bifold.fill" />
            <Label>Budget</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
        <AddFab />
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Scene container behind each tab — without this it flashes white
        // between tab switches in dark mode.
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="budget" />
    </Tabs>
  );
}
