import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useColors } from '@/theme/useTheme';

export default function TabsLayout() {
  const colors = useColors();
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
      <Tabs.Screen name="daily" />
      <Tabs.Screen name="weekly" />
      <Tabs.Screen name="budget" />
    </Tabs>
  );
}
