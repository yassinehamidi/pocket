import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarDots,
  Leaf,
  Lightning,
  Minus,
  Plus,
  ShoppingCart,
  Sparkle,
} from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PocketPop } from '@/components/PocketPop';
import { useTabBarClearance } from '@/components/TabBar';
import { confirmAction } from '@/lib/confirm';
import { niceDate } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import { getDailyBudget, getNoSpendStats, getWishAffordability } from '@/lib/selectors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

export default function GoalsScreen() {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabBarClearance();
  const router = useRouter();
  const transactions = useFinanceStore((s) => s.transactions);
  const bills = useFinanceStore((s) => s.bills);
  const debts = useFinanceStore((s) => s.debts);
  const settings = useFinanceStore((s) => s.settings);
  const savings = useFinanceStore((s) => s.savings);
  const wishes = useFinanceStore((s) => s.wishes);
  const removeWish = useFinanceStore((s) => s.removeWish);
  const buyWish = useFinanceStore((s) => s.buyWish);
  const setSalaryDay = useFinanceStore((s) => s.setSalaryDay);

  const wishPlan = getWishAffordability(transactions, settings, bills, debts, savings);
  const dailyBudget = getDailyBudget(settings, bills, debts);
  const noSpend = getNoSpendStats(transactions);
  const free = wishPlan.freeForWishes;
  const totalWished = wishes.reduce((a, w) => a + w.price, 0);

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: tabClearance }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Goals</Text>

      <LinearGradient
        colors={colors.greenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.heroCard}>
        <View style={styles.deco} />
        <Text style={styles.heroLabel}>Free for wishes until salary</Text>
        <Text style={styles.heroValue}>{fmtMoney(Math.max(0, free))}</Text>
        <View style={styles.heroChipRow}>
          <View style={styles.heroChip}>
            <CalendarDots size={15} color={colors.white} weight="fill" />
            <Text style={styles.heroChipText}>
              Salary in {wishPlan.daysToSalary} day{wishPlan.daysToSalary === 1 ? '' : 's'}
            </Text>
          </View>
          {wishes.length > 0 && (
            <View style={styles.heroChip}>
              <Sparkle size={15} color={colors.white} weight="fill" />
              <Text style={styles.heroChipText}>
                {wishes.length} wish{wishes.length === 1 ? '' : 'es'} · {fmtMoney(totalWished)}
              </Text>
            </View>
          )}
        </View>
        {free < 0 && (
          <Text style={styles.heroNote}>
            You're {fmtMoney(-free)} over plan right now — go easy until payday and this
            fund will refill.
          </Text>
        )}
      </LinearGradient>

      <View style={styles.salaryCard}>
        <View style={[styles.iconTile, { backgroundColor: colors.blueBgSoft }]}>
          <CalendarDots size={21} color={colors.blue} weight="fill" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.salaryTitle}>
            Next salary {niceDate(wishPlan.nextSalaryDate)}
            <Text style={styles.salaryDays}> · in {wishPlan.daysToSalary} day{wishPlan.daysToSalary === 1 ? '' : 's'}</Text>
          </Text>
          <Text style={styles.salarySub}>Paid on day {settings.salaryDay} of each month</Text>
        </View>
        <View style={styles.stepperBtns}>
          <Pressable style={styles.minusBtn} onPress={() => setSalaryDay(settings.salaryDay - 1)}>
            <Minus size={16} color={colors.textSecondary} weight="bold" />
          </Pressable>
          <Pressable style={styles.plusBtn} onPress={() => setSalaryDay(settings.salaryDay + 1)}>
            <Plus size={16} color={colors.white} weight="bold" />
          </Pressable>
        </View>
      </View>
      <Text style={styles.hint}>
        Reserved until then: bills {fmtMoney(wishPlan.reserved.bills)} · debt{' '}
        {fmtMoney(wishPlan.reserved.debt)} · savings {fmtMoney(wishPlan.reserved.savings)} · daily
        life {fmtMoney(wishPlan.reserved.daily)}
      </Text>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Wishlist</Text>
        <Pressable style={styles.addSmallBtn} onPress={() => router.push('/new-wish')}>
          <Plus size={14} color={colors.white} weight="bold" />
        </Pressable>
      </View>

      {wishes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Add something you're dreaming of — Pocket will tell you when you can buy it
            without hurting the rest of your month.
          </Text>
        </View>
      ) : (
        <View style={styles.wishList}>
          {wishes.map((w) => {
            const leftover = free - w.price;
            const ok = leftover >= 0;
            const funded =
              w.price > 0 ? Math.max(0, Math.min(100, Math.round((free / w.price) * 100))) : 100;
            // Trimming this much off each remaining day's budget covers the gap
            // before payday; only suggest it when it leaves room to live on.
            const perDay =
              !ok && wishPlan.daysToSalary > 0 ? Math.ceil(-leftover / wishPlan.daysToSalary) : 0;
            const canTrim = perDay > 0 && perDay < dailyBudget;
            return (
              <Pressable
                key={w.id}
                style={styles.wishCard}
                onLongPress={() =>
                  confirmAction('Remove wish?', `Delete "${w.name}" from your wishlist.`, () =>
                    removeWish(w.id),
                  )
                }>
                <View style={styles.wishRow}>
                  <View style={[styles.iconTile, { backgroundColor: colors.greenIconTileBg }]}>
                    <Sparkle size={21} color={colors.greenIconTileFg} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wishName}>{w.name}</Text>
                    <Text style={styles.wishPrice}>{fmtMoney(w.price)}</Text>
                  </View>
                  {ok && (
                    <Pressable
                      style={styles.buyBtn}
                      onPress={() =>
                        confirmAction(
                          'Buy it?',
                          `Spend ${fmtMoney(w.price)} on "${w.name}"? It will be added to your expenses.`,
                          () => buyWish(w.id),
                        )
                      }>
                      <ShoppingCart size={15} color={colors.white} weight="fill" />
                      <Text style={styles.buyBtnText}>Buy</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.wishTrackRow}>
                  <View style={styles.wishTrack}>
                    <View style={[styles.wishFill, { width: `${funded}%` }]} />
                  </View>
                  <Text style={styles.wishFunded}>{funded}%</Text>
                </View>
                <View
                  style={[
                    styles.wishVerdict,
                    { backgroundColor: ok ? colors.greenBgSoft : colors.redBgSoft },
                  ]}>
                  <Text
                    style={[
                      styles.wishVerdictText,
                      { color: ok ? colors.greenDark : colors.redDark },
                    ]}>
                    {ok
                      ? `You can buy this — ${fmtMoney(leftover)} still free until your salary`
                      : `Short by ${fmtMoney(-leftover)} — easier after your salary in ${wishPlan.daysToSalary} day${wishPlan.daysToSalary === 1 ? '' : 's'}`}
                  </Text>
                </View>
                {canTrim && (
                  <View style={styles.planRow}>
                    <Lightning size={14} color={colors.blue} weight="fill" />
                    <Text style={styles.planText}>
                      Skip {fmtMoney(perDay)} of your daily budget until payday and it's yours
                      before the salary even lands.
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
          <Text style={styles.hint}>Hold a wish to remove it</Text>
        </View>
      )}

      {transactions.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Boost your wish fund</Text>
          </View>
          <View style={styles.boostCard}>
            <View style={[styles.iconTile, { backgroundColor: colors.greenBgSoft }]}>
              <Leaf size={21} color={colors.greenDark} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.boostTitle}>
                {noSpend.count === 0
                  ? 'No no-spend days yet this month'
                  : `${noSpend.count} no-spend day${noSpend.count === 1 ? '' : 's'} this month`}
              </Text>
              <Text style={styles.boostSub}>
                {noSpend.bestStreak > 1 ? `Best streak: ${noSpend.bestStreak} days in a row. ` : ''}
                Every day without spending leaves about {fmtMoney(dailyBudget)} extra in your
                pocket for these wishes.
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: {
    ...type.screenTitle,
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 14,
    marginHorizontal: 2,
  },

  heroCard: {
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#158a4c',
    shadowOpacity: 0.6,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  deco: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroLabel: { ...type.cardLabel, color: colors.white, opacity: 0.9 },
  heroValue: { ...type.bigFigure, color: colors.white, marginTop: 4 },
  heroChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  heroChipText: { fontFamily: fonts.extraBold, fontSize: 12.5, color: colors.white },
  heroNote: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.white,
    opacity: 0.85,
    marginTop: 14,
  },

  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtns: { flexDirection: 'row', gap: 8 },
  minusBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  salaryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 13,
    marginBottom: 8,
  },
  salaryTitle: { ...type.rowTitle, color: colors.textPrimary },
  salaryDays: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textMuted },
  salarySub: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 1 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  sectionTitle: { ...type.subsectionTitle, color: colors.textPrimary },
  addSmallBtn: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { ...type.rowSubtitle, color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    borderRadius: 20,
    padding: 20,
  },
  emptyText: { ...type.rowSubtitle, color: colors.textMuted, lineHeight: 18 },

  wishList: { gap: 9 },
  wishCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  wishRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wishName: { ...type.rowTitle, color: colors.textPrimary },
  wishPrice: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.textPrimary, marginTop: 1 },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.green,
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  buyBtnText: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.white },
  wishTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
  wishTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  wishFill: { height: '100%', borderRadius: 4, backgroundColor: colors.green },
  wishFunded: { fontFamily: fonts.extraBold, fontSize: 11, color: colors.textMuted },
  wishVerdict: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginTop: 11,
  },
  wishVerdictText: { fontFamily: fonts.extraBold, fontSize: 12, lineHeight: 17 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  planText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textBody,
  },

  boostCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  boostTitle: { ...type.rowTitle, color: colors.textPrimary },
  boostSub: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
}));
