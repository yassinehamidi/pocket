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
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/theme/colors';
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
    body: 'The Daily tab shows how much is safe to spend today, and a ring that fills as you spend. Log how the day felt with the mood picker.',
  },
  {
    key: 'weekly',
    icon: ChartBar,
    title: 'See your week',
    body: 'The Weekly tab charts your last 7 days, compares them to the week before, and shows where the money actually went.',
  },
  {
    key: 'budget',
    icon: PiggyBank,
    title: 'Plan your budget',
    body: 'Set your salary, savings goal, fixed bills, and debts in the Budget tab. Pocket splits what’s left into a daily budget for you.',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === 'number') setIndex(first.index);
    },
  ).current;

  const isLast = index === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
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

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => {
          const SlideIcon = item.icon;
          return (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconTile}>
                <SlideIcon size={64} color={colors.greenDark} weight="fill" />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={isLast ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.trackRing,
  },
  dotActive: { width: 22, backgroundColor: colors.green },

  footer: { paddingHorizontal: 24 },
});
