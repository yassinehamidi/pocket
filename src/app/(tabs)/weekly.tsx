import {
  ArrowCircleDown,
  ArrowCircleUp,
  CaretLeft,
  CaretRight,
  ChartBar,
  TrendDown,
  TrendUp,
} from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DayHistoryCard } from '@/components/DayHistoryCard';
import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PocketPop } from '@/components/PocketPop';
import { useTabBarClearance } from '@/components/TabBar';
import { last7Days, monthLabel, niceDate, todayISO } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import {
  getMonthHistory,
  getMonthsWithData,
  getTopCategoriesThisWeek,
  getWeekDayBars,
  getWeekDelta,
  getWeekTotals,
} from '@/lib/selectors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

const MAX_BAR_HEIGHT = 118;

export default function WeeklyScreen() {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabBarClearance();
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  // Subscribed so amounts re-format when the user changes region/currency.
  useFinanceStore((s) => s.settings.currency);

  const { weekIn, weekOut } = getWeekTotals(transactions);
  const bars = getWeekDayBars(transactions);
  const delta = getWeekDelta(transactions);
  const topCats = getTopCategoriesThisWeek(transactions, categories);
  const weekStart = last7Days()[0];

  const months = getMonthsWithData(transactions);
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  // Fall back to the latest month when nothing is picked or the pick has no data anymore.
  const month = pickedMonth && months.includes(pickedMonth) ? pickedMonth : months[0];
  const monthIdx = month ? months.indexOf(month) : -1;
  const monthHistory = month ? getMonthHistory(transactions, month) : null;

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: tabClearance }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Weekly check</Text>
      <Text style={styles.subtitle}>
        {niceDate(weekStart)} – {niceDate(todayISO())}
      </Text>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartLabel}>Spent this week</Text>
            <Text style={styles.chartValue}>{fmtMoney(weekOut)}</Text>
          </View>
          <View
            style={[
              styles.deltaPill,
              { backgroundColor: delta.more ? colors.redBgSoft : colors.greenBgSoft },
            ]}>
            {delta.more ? (
              <TrendUp size={14} color={colors.redDark} weight="bold" />
            ) : (
              <TrendDown size={14} color={colors.greenDark} weight="bold" />
            )}
            <Text
              style={[
                styles.deltaText,
                { color: delta.more ? colors.redDark : colors.greenDark },
              ]}>
              {delta.pct}% {delta.more ? 'more' : 'less'}
            </Text>
          </View>
        </View>

        <View style={styles.barsRow}>
          {bars.map((d) => (
            <View key={d.date} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(5, Math.round(d.ratio * MAX_BAR_HEIGHT)),
                    backgroundColor: d.isToday ? colors.green : colors.greenBarInactive,
                  },
                ]}
              />
              <Text
                style={[
                  styles.barLabel,
                  { color: d.isToday ? colors.textPrimary : colors.textMuted },
                ]}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <View style={styles.statLabelRow}>
            <ArrowCircleDown size={14} color={colors.green} weight="fill" />
            <Text style={[styles.statLabel, { color: colors.green }]}>Income</Text>
          </View>
          <Text style={styles.statValue}>{fmtMoney(weekIn)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statLabelRow}>
            <ArrowCircleUp size={14} color={colors.red} weight="fill" />
            <Text style={[styles.statLabel, { color: colors.red }]}>Spending</Text>
          </View>
          <Text style={styles.statValue}>{fmtMoney(weekOut)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Top categories</Text>
      {topCats.length === 0 && (
        <View style={styles.emptyCard}>
          <ChartBar size={30} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Nothing spent this week yet — your top categories will show up here.
          </Text>
        </View>
      )}
      <View style={styles.catList}>
        {topCats.map((c) => (
          <View key={c.key} style={styles.catCard}>
            <View style={styles.catRow}>
              <View style={[styles.catIconTile, { backgroundColor: `${c.color}1f` }]}>
                <PhosphorIcon name={c.icon} size={18} color={c.color} />
              </View>
              <Text style={styles.catLabel}>{c.label}</Text>
              <Text style={styles.catAmount}>{fmtMoney(c.amount)}</Text>
            </View>
            <View style={styles.catTrack}>
              <View style={[styles.catFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Monthly history</Text>
      {month && monthHistory ? (
        <>
          <View style={styles.monthPicker}>
            <Pressable
              style={[styles.monthBtn, monthIdx >= months.length - 1 && styles.monthBtnDisabled]}
              disabled={monthIdx >= months.length - 1}
              onPress={() => setPickedMonth(months[monthIdx + 1])}>
              <CaretLeft size={16} color={colors.textSecondary} weight="bold" />
            </Pressable>
            <View style={styles.monthLabelWrap}>
              <Text style={styles.monthLabel}>{monthLabel(month)}</Text>
              <Text style={styles.monthTotals}>
                <Text style={{ color: colors.green }}>+{fmtMoney(monthHistory.monthIn)}</Text>
                {'   '}
                <Text style={{ color: colors.red }}>-{fmtMoney(monthHistory.monthOut)}</Text>
              </Text>
            </View>
            <Pressable
              style={[styles.monthBtn, monthIdx <= 0 && styles.monthBtnDisabled]}
              disabled={monthIdx <= 0}
              onPress={() => setPickedMonth(months[monthIdx - 1])}>
              <CaretRight size={16} color={colors.textSecondary} weight="bold" />
            </Pressable>
          </View>
          <View style={styles.dayList}>
            {monthHistory.days.map((day) => (
              <DayHistoryCard key={day.date} day={day} />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <ChartBar size={30} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            No history yet — every month you track will be browsable here.
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

  chartCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  chartLabel: { ...type.cardLabel, color: colors.textMuted },
  chartValue: { ...type.weeklyFigure, color: colors.textPrimary, marginTop: 2 },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 16,
  },
  deltaText: { fontFamily: fonts.extraBold, fontSize: 12 },

  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 7,
    height: 140,
    marginTop: 18,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 8, justifyContent: 'flex-end', height: '100%' },
  bar: {
    width: '100%',
    maxWidth: 26,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  barLabel: { fontFamily: fonts.extraBold, fontSize: 11 },

  statRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 15,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { ...type.smallLabel },
  statValue: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 4,
  },

  sectionTitle: {
    ...type.subsectionTitle,
    color: colors.textPrimary,
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  catList: { gap: 11 },
  catCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  catIconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.greenIconTileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { ...type.rowTitle, color: colors.textPrimary, flex: 1 },
  catAmount: { ...type.statValue, color: colors.textPrimary },
  catTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: 10,
    overflow: 'hidden',
  },
  catFill: { height: '100%', borderRadius: 4, backgroundColor: colors.green },

  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 11,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtnDisabled: { opacity: 0.35 },
  monthLabelWrap: { alignItems: 'center', gap: 2 },
  monthLabel: { ...type.rowTitle, color: colors.textPrimary },
  monthTotals: { ...type.smallLabel },
  dayList: { gap: 11 },

  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
  },
  emptyText: {
    ...type.rowSubtitle,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
}));
