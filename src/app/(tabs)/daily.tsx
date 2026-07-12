import { CheckCircle, Confetti, Warning } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { DayHistoryCard } from '@/components/DayHistoryCard';
import { PocketPop } from '@/components/PocketPop';
import { useTabBarClearance } from '@/components/TabBar';
import { TransactionRow } from '@/components/TransactionRow';
import { niceDate, todayISO } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import {
  DaySegment,
  getDailyBudget,
  getDayHistory,
  getTodayCategorySegments,
  getTodaySpent,
  getTodayTransactions,
} from '@/lib/selectors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

const RING_SIZE = 196;
const RING_STROKE = 23;

function ProgressRing({ pct, segments }: { pct: number; segments: DaySegment[] }) {
  const colors = useColors();
  const r = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (pct / 100) * circumference;
  // Tiny gap between segments so adjacent category colors read as distinct.
  const gap = segments.length > 1 ? 3 : 0;

  let cursor = 0;
  const arcs = segments.map((s) => {
    const start = cursor;
    const len = Math.max(0, progress * s.fraction - gap);
    cursor += progress * s.fraction;
    return { key: s.key, color: s.color, start, len };
  });

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
      {arcs
        .filter((a) => a.len > 0.5)
        .map((a) => (
          <Circle
            key={a.key}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={r}
            stroke={a.color}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={`${a.len} ${circumference - a.len}`}
            strokeDashoffset={-a.start}
          />
        ))}
    </Svg>
  );
}

export default function DailyScreen() {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabBarClearance();
  const transactions = useFinanceStore((s) => s.transactions);
  const bills = useFinanceStore((s) => s.bills);
  const debts = useFinanceStore((s) => s.debts);
  const settings = useFinanceStore((s) => s.settings);

  const categories = useFinanceStore((s) => s.categories);
  const dailyBudget = getDailyBudget(settings, bills, debts);
  const todaySpent = getTodaySpent(transactions);
  const todayTx = getTodayTransactions(transactions);
  const segments = getTodayCategorySegments(transactions, categories);
  const history = getDayHistory(transactions, { excludeToday: true });
  const pct = dailyBudget > 0 ? Math.min(100, Math.round((todaySpent / dailyBudget) * 100)) : 0;
  const over = todaySpent > dailyBudget;

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: tabClearance }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Daily check</Text>
      <Text style={styles.subtitle}>Today · {niceDate(todayISO())}</Text>

      <View style={styles.ringWrap}>
        <ProgressRing pct={pct} segments={segments} />
        <View style={styles.ringCenter}>
          <Text style={styles.ringLabel}>Spent today</Text>
          <Text style={styles.ringValue}>{fmtMoney(todaySpent)}</Text>
          <Text style={styles.ringLabel}>of {fmtMoney(dailyBudget)}</Text>
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

      <Text style={styles.sectionTitle}>History</Text>
      {history.length > 0 ? (
        <View style={styles.txList}>
          {history.map((day) => (
            <DayHistoryCard key={day.date} day={day} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Past days will show up here as you track your spending.
          </Text>
        </View>
      )}
    </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
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
}));
