import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, View } from 'react-native';

import { AddFab } from '@/components/AddFab';
import { TabBar } from '@/components/TabBar';
import { useColors } from '@/theme/useTheme';

export default function TabsLayout() {
  const colors = useColors();

  // iOS gets the real system tab bar (UITabBarController) — on iOS 26 that's
  // the genuine Liquid Glass bar with morphing, scroll-edge effects, and
  // minimize-on-scroll. The "+" lives in a detached floating glass circle
  // (native bars have no FAB slot; this is the iOS 26 pattern for it).
  if (Platform.OS === 'ios') {
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
