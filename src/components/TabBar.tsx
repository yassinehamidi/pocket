import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BottomTabBarProps } from 'expo-router/js-tabs';
import {
  CalendarCheck,
  ChartBar,
  House,
  Icon,
  Plus,
  Wallet,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { themedStyles, useColors, useScheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';

const TABS: { name: string; label: string; icon: Icon }[] = [
  { name: 'index', label: 'Home', icon: House },
  { name: 'daily', label: 'Daily', icon: CalendarCheck },
  { name: 'weekly', label: 'Weekly', icon: ChartBar },
  { name: 'budget', label: 'Budget', icon: Wallet },
];

/** Slot layout inside the bar: 4 tabs around a center FAB. */
const SLOTS = ['index', 'daily', '__fab__', 'weekly', 'budget'] as const;

/**
 * Bottom padding tab screens should give their scroll content. On iOS the
 * bar floats over the content (liquid glass), so screens need clearance to
 * scroll their last items above it; on Android the bar is in-flow.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? insets.bottom + 108 : 32;
}

/**
 * Custom tab bar: Home, Daily, [+ FAB → Add modal], Weekly, Budget.
 * iOS gets the floating liquid-glass pill (iOS 26 style, with a springy
 * sliding highlight); Android and web keep the classic in-flow bar.
 */
export function TabBar(props: BottomTabBarProps) {
  return Platform.OS === 'ios' ? <GlassTabBar {...props} /> : <ClassicTabBar {...props} />;
}

/* ------------------------------ iOS: liquid glass ------------------------------ */

const SPRING = { damping: 16, stiffness: 220 };
const HIGHLIGHT_W = 58;

function GlassTab({
  tab,
  focused,
  color,
  onPress,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
  color: string;
  onPress: () => void;
}) {
  const IconComponent = tab.icon;
  const animStyle = useAnimatedStyle(
    () => ({
      transform: [
        { scale: withSpring(focused ? 1.12 : 1, SPRING) },
        { translateY: withSpring(focused ? -1.5 : 0, SPRING) },
      ],
    }),
    [focused],
  );
  return (
    <Pressable style={iosStyles.slot} onPress={onPress}>
      <Animated.View style={[iosStyles.tabInner, animStyle]}>
        <IconComponent size={23} color={color} weight={focused ? 'fill' : 'regular'} />
        <Text style={[iosStyles.label, { color }]}>{tab.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function GlassFab({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      style={iosStyles.slot}
      onPressIn={() => (scale.value = withSpring(0.88, SPRING))}
      onPressOut={() => (scale.value = withSpring(1, SPRING))}
      onPress={onPress}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={['#22a860', '#158a4c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={iosStyles.fab}>
          <Plus size={25} color="#ffffff" weight="bold" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const scheme = useScheme();
  const [barWidth, setBarWidth] = useState(0);

  const activeRoute = state.routes[state.index]?.name;
  const activeSlot = SLOTS.indexOf(activeRoute as (typeof SLOTS)[number]);
  const slotW = barWidth / SLOTS.length;

  const highlightX = useSharedValue(0);
  useEffect(() => {
    if (barWidth > 0 && activeSlot >= 0) {
      highlightX.value = withSpring(activeSlot * slotW + (slotW - HIGHLIGHT_W) / 2, SPRING);
    }
  }, [activeSlot, barWidth, slotW, highlightX]);
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highlightX.value }],
  }));

  const glass = isLiquidGlassAvailable();
  const highlightTint =
    scheme === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(31,157,90,0.13)';

  const renderTab = (tab: (typeof TABS)[number]) => {
    const focused = activeRoute === tab.name;
    return (
      <GlassTab
        key={tab.name}
        tab={tab}
        focused={focused}
        color={focused ? colors.green : colors.textMuted}
        onPress={() => navigation.navigate(tab.name)}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[iosStyles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <GlassView
        glassEffectStyle="regular"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={[
          iosStyles.bar,
          !glass &&
            (scheme === 'dark' ? iosStyles.barFallbackDark : iosStyles.barFallbackLight),
        ]}>
        {barWidth > 0 && activeSlot >= 0 && (
          <Animated.View
            style={[iosStyles.highlight, { backgroundColor: highlightTint }, highlightStyle]}
          />
        )}
        {renderTab(TABS[0])}
        {renderTab(TABS[1])}
        <GlassFab onPress={() => router.push('/add')} />
        {renderTab(TABS[2])}
        {renderTab(TABS[3])}
      </GlassView>
    </View>
  );
}

const iosStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  // Older iOS without Liquid Glass: translucent fallback so the pill still reads.
  barFallbackLight: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  barFallbackDark: {
    backgroundColor: 'rgba(28,33,28,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    width: HIGHLIGHT_W,
    height: 48,
    borderRadius: 24,
    top: 10,
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  tabInner: { alignItems: 'center', gap: 3 },
  label: { fontFamily: fonts.extraBold, fontSize: 10 },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#158a4c',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
});

/* --------------------------- Android & web: classic bar --------------------------- */

function ClassicTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useClassicStyles();

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

const useClassicStyles = themedStyles((colors) => StyleSheet.create({
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