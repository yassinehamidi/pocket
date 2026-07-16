import {
  CalendarCheck,
  ChartBar,
  Coins,
  Icon,
  PiggyBank,
  Plus,
  Wallet,
} from 'phosphor-react-native';
import { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/useAuthStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

interface Slide {
  key: string;
  icon: Icon;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    icon: Wallet,
    title: 'Welcome to Pocket',
    body: 'Your money, at a glance. Pocket keeps your balance, spending, and budget in one simple place — all stored privately on your phone.',
  },
  {
    key: 'add',
    icon: Plus,
    title: 'Add in seconds',
    body: 'Tap the big green + button any time to record an expense or income. Pick a category, type the amount on the keypad, done.',
  },
  {
    key: 'daily',
    icon: CalendarCheck,
    title: 'Check in daily',
    body: 'The History tab’s Daily view shows how much is safe to spend today, and a ring that fills as you spend. Log how the day felt with the mood picker.',
  },
  {
    key: 'weekly',
    icon: ChartBar,
    title: 'See your week',
    body: 'Switch History to Weekly to chart your last 7 days, compare them to the week before, and see where the money actually went.',
  },
  {
    key: 'budget',
    icon: PiggyBank,
    title: 'Plan your budget',
    body: 'Set your salary, savings goal, fixed bills, and debts in the Budget tab. Pocket splits what’s left into a daily budget for you.',
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  // Dots and slide parallax are driven directly by the scroll offset, so
  // they animate in lockstep with the swipe/scroll on every platform.
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / width);
      if (page >= 0 && page < SLIDES.length) {
        setIndex((current) => (page !== current ? page : current));
      }
    },
  });

  const isLast = index === SLIDES.length - 1;

  // With animated: true, react-native-web maps this to the browser's own
  // smooth scrolling (node.scroll({ behavior: 'smooth' })), and native
  // animates as usual — no platform branch needed.
  const scrollToPage = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * width, animated: true });
  };

  const next = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      scrollToPage(index + 1);
      setIndex(index + 1);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <Coins size={20} color={colors.green} weight="fill" />
          <Text style={styles.logoText}>Pocket</Text>
        </View>
        <Pressable onPress={completeOnboarding} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Plain ScrollView: on web its ref is the host node (with scrollTo and
          getScrollableNode attached); Animated.ScrollView's ref exposes neither. */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}>
        {SLIDES.map((item, i) => {
          const SlideIcon = item.icon;
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.2, 1, 0.2],
            extrapolate: 'clamp',
          });
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.88, 1, 0.88],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [14, 0, 14],
            extrapolate: 'clamp',
          });
          return (
            <View key={item.key} style={[styles.slide, { width }]}>
              <Animated.View
                style={[styles.slideInner, { opacity, transform: [{ scale }, { translateY }] }]}>
                <View style={styles.iconTile}>
                  <SlideIcon size={64} color={colors.greenDark} weight="fill" />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </Animated.View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((s, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 22, 8],
            extrapolate: 'clamp',
          });
          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: [colors.trackRing, colors.green, colors.trackRing],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={s.key}
              style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={isLast ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { ...type.sectionTitle, color: colors.textPrimary },
  skip: { ...type.cardLabel, color: colors.textMuted },

  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  slideInner: { alignItems: 'center' },
  iconTile: {
    width: 132,
    height: 132,
    borderRadius: 44,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 27,
    letterSpacing: -0.5,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: 12,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 22,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  footer: { paddingHorizontal: 24 },
}));
