import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ClockCounterClockwise,
  House,
  Icon,
  Plus,
  Target,
  Wallet,
} from 'phosphor-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';

const TABS: { name: string; label: string; icon: Icon }[] = [
  { name: 'index', label: 'Home', icon: House },
  { name: 'history', label: 'History', icon: ClockCounterClockwise },
  { name: 'goals', label: 'Goals', icon: Target },
  { name: 'budget', label: 'Budget', icon: Wallet },
];

/**
 * Bottom padding tab screens should give their scroll content. On iOS the
 * native tab bar floats over the content (Liquid Glass), and the floating
 * "+" button needs room too; on Android the bar is in-flow.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? insets.bottom + 108 : 32;
}

/**
 * Classic in-flow tab bar with a center FAB — used on Android and web.
 * iOS uses the native system tab bar instead (see app/(tabs)/_layout.tsx).
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useStyles();

  const renderTab = (tab: (typeof TABS)[number]) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
    const focused = state.index === routeIndex;
    const color = focused ? colors.green : colors.textMuted;
    const IconComponent = tab.icon;
    return (
      <Pressable
        key={tab.name}
        style={styles.tab}
        onPress={() => navigation.navigate(tab.name)}>
        <IconComponent size={23} color={color} weight={focused ? 'fill' : 'regular'} />
        <Text style={[styles.label, { color }]}>{tab.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
      {renderTab(TABS[0])}
      {renderTab(TABS[1])}
      <Pressable onPress={() => router.push('/add')} style={styles.fabWrap}>
        <LinearGradient
          colors={['#22a860', '#158a4c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}>
          <Plus size={26} color={colors.white} weight="bold" />
        </LinearGradient>
      </Pressable>
      {renderTab(TABS[2])}
      {renderTab(TABS[3])}
    </View>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tab: { alignItems: 'center', gap: 3, minWidth: 52 },
  label: { fontFamily: fonts.extraBold, fontSize: 10 },
  fabWrap: { marginTop: -16 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#158a4c',
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
}));
