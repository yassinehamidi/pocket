import {
  CheckCircle,
  Confetti,
  Smiley,
  SmileyMeh,
  SmileyNervous,
  Warning,
} from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { PocketPop } from '@/components/PocketPop';
import { TransactionRow } from '@/components/TransactionRow';
import { niceDate, todayISO } from '@/lib/dates';
import { fmtDH } from '@/lib/format';
import { getDailyBudget, getTodaySpent, getTodayTransactions } from '@/lib/selectors';
import { Mood } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

const RING_SIZE = 196;
const RING_STROKE = 23;

function ProgressRing({ pct }: { pct: number }) {
  const r = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <Svg
      width={RING_SIZE}
      height={RING_SIZE}
      style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={r}
        stroke={colors.trackRing}
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={r}
        stroke={colors.green}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
      />
    </Svg>
  );
}

const MOODS: { key: Mood; label: string; icon: typeof Smiley }[] = [
  { key: 'great', label: 'Great', icon: Smiley },
  { key: 'okay', label: 'Okay', icon: SmileyMeh },
  { key: 'tight', label: 'Tight', icon: SmileyNervous },
];

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const transactions = useFinanceStore((s) => s.transactions);
  const bills = useFinanceStore((s) => s.bills);
  const debts = useFinanceStore((s) => s.debts);
  const settings = useFinanceStore((s) => s.settings);
  const mood = useFinanceStore((s) => s.mood);
  const setMood = useFinanceStore((s) => s.setMood);

  const dailyBudget = getDailyBudget(settings, bills, debts);
  const todaySpent = getTodaySpent(transactions);
  const todayTx = getTodayTransactions(transactions);
  const pct = dailyBudget > 0 ? Math.min(100, Math.round((todaySpent / dailyBudget) * 100)) : 0;
  const over = todaySpent > dailyBudget;

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Daily check</Text>
      <Text style={styles.subtitle}>Today · {niceDate(todayISO())}</Text>

      <View style={styles.ringWrap}>
        <ProgressRing pct={pct} />
        <View style={styles.ringCenter}>
          <Text style={styles.ringLabel}>Spent today</Text>
          <Text style={styles.ringValue}>{fmtDH(todaySpent)}</Text>
          <Text style={styles.ringLabel}>of {fmtDH(dailyBudget)}</Text>
        </View>
      </View>

      <View style={styles.pillWrap}>
        <View
          style={[
            styles.pill,
            { backgroundColor: over ? colors.redBgSoft : colors.greenBgSoft },
          ]}>
          {over ? (
            <Warning size={16} color={colors.redDark} weight="fill" />
          ) : (
            <CheckCircle size={16} color={colors.greenDark} weight="fill" />
          )}
          <Text style={[styles.pillText, { color: over ? colors.redDark : colors.greenDark }]}>
            {over ? 'Over your daily budget' : 'You’re on track'}
          </Text>
        </View>
      </View>

      <View style={styles.moodCard}>
        <Text style={styles.moodTitle}>How did today feel?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const selected = mood === m.key;
            const MoodIcon = m.icon;
            const fg = selected ? colors.greenDark : colors.moodMuted;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMood(m.key)}
                style={[styles.moodBtn, selected && styles.moodBtnSelected]}>
                <MoodIcon size={20} color={fg} weight="fill" />
                <Text style={[styles.moodLabel, { color: fg }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today&apos;s spending</Text>
      {todayTx.length > 0 ? (
        <View style={styles.txList}>
          {todayTx.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} showDate={false} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Confetti size={30} color={colors.textMuted} />
          <Text style={styles.emptyText}>No spending yet today</Text>
        </View>
      )}
    </ScrollView>
    </PocketPop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { ...type.screenTitle, color: colors.textPrimary, marginTop: 6, marginHorizontal: 2 },
  subtitle: { ...type.cardLabel, color: colors.textMuted, marginHorizontal: 2, marginBottom: 14 },

  ringWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  ringCenter: { position: 'absolute', alignItems: 'center', gap: 2 },
  ringLabel: { ...type.smallLabel, color: colors.textMuted },
  ringValue: { ...type.ringFigure, color: colors.textPrimary },

  pillWrap: { alignItems: 'center', marginTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 22,
  },
  pillText: { fontFamily: fonts.extraBold, fontSize: 13 },

  moodCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  moodTitle: { ...type.cardLabel, color: colors.textPrimary },
  moodRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.card,
  },
  moodBtnSelected: { borderColor: colors.green, backgroundColor: colors.greenBgSoft },
  moodLabel: { ...type.smallLabel },

  sectionTitle: {
    ...type.subsectionTitle,
    color: colors.textPrimary,
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  txList: { gap: 9 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
  },
  emptyText: { ...type.cardLabel, color: colors.textMuted, marginTop: 8 },
});
