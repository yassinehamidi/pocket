import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarDots,
  Leaf,
  Lightning,
  LockSimple,
  Minus,
  PiggyBank,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkle,
  Trophy,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PocketPop } from '@/components/PocketPop';
import { useTabBarClearance } from '@/components/TabBar';
import { confirmAction } from '@/lib/confirm';
import { niceDate } from '@/lib/dates';
import { currencySymbol, fmtMoney } from '@/lib/format';
import {
  getChallengeProgress,
  getNoSpendStats,
  getSpendPlan,
  getWishAffordability,
} from '@/lib/selectors';
import { ChallengeMode } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

/**
 * Motivational lines per challenge state — one is picked per day so the
 * screen feels alive without being random on every render.
 */
const MESSAGES = {
  onTrack: [
    'Fully protected — your future self is smiling.',
    'Nothing has touched your goal yet. Keep it that way.',
    'Saving is just paying the person you’ll become.',
  ],
  slipping: [
    'You’ve dipped into the goal — hold the line from today.',
    'Not lost yet: keep the next days lean and win it back.',
    'Small trims, big comeback. You’ve got this.',
  ],
  gone: [
    'This month got away — it happens. Next payday is a fresh start.',
    'Nothing protected right now. Trim spending or add income to claw back.',
  ],
  locked: [
    'Locked away on day one — the strongest move in saving.',
    'Out of sight, out of temptation. That money is already yours.',
  ],
};

function dailyPick(messages: string[]): string {
  return messages[new Date().getDate() % messages.length];
}

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
  const challenge = useFinanceStore((s) => s.challenge);
  const lastResult = useFinanceStore((s) => s.lastChallengeResult);
  const removeWish = useFinanceStore((s) => s.removeWish);
  const buyWish = useFinanceStore((s) => s.buyWish);
  const setSalaryDay = useFinanceStore((s) => s.setSalaryDay);
  const setChallenge = useFinanceStore((s) => s.setChallenge);
  const cancelChallenge = useFinanceStore((s) => s.cancelChallenge);
  const settleStaleChallenge = useFinanceStore((s) => s.settleStaleChallenge);

  useEffect(() => {
    settleStaleChallenge();
  }, [settleStaleChallenge]);

  const plan = getSpendPlan(transactions, settings, bills, debts, savings, challenge);
  const wishPlan = getWishAffordability(transactions, settings, bills, debts, savings, challenge);
  const noSpend = getNoSpendStats(transactions);
  const totalWished = wishes.reduce((a, w) => a + w.price, 0);

  const progress = challenge
    ? getChallengeProgress(transactions, settings, bills, debts, savings, challenge)
    : null;

  // Challenge setup form state.
  const [targetDraft, setTargetDraft] = useState<string | null>(null);
  const [mode, setMode] = useState<ChallengeMode>('reserve');
  const defaultTarget = settings.savingsGoal > 0 ? String(settings.savingsGoal) : '';
  const targetValue = parseFloat(targetDraft ?? defaultTarget);
  const targetValid = !isNaN(targetValue) && targetValue > 0;

  const challengeMessage = challenge
    ? challenge.mode === 'lock'
      ? dailyPick(MESSAGES.locked)
      : progress!.onTrack
        ? dailyPick(MESSAGES.onTrack)
        : progress!.protectedAmount > 0
          ? dailyPick(MESSAGES.slipping)
          : dailyPick(MESSAGES.gone)
    : '';

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
        <Text style={styles.heroLabel}>Free until payday</Text>
        <Text style={styles.heroValue}>{fmtMoney(Math.max(0, plan.freeUntilPayday))}</Text>
        <View style={styles.heroChipRow}>
          <View style={styles.heroChip}>
            <CalendarDots size={15} color={colors.white} weight="fill" />
            <Text style={styles.heroChipText}>
              Payday in {plan.daysToPayday} day{plan.daysToPayday === 1 ? '' : 's'}
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
        <Text style={styles.heroNote}>
          {plan.freeUntilPayday < 0
            ? `You're ${fmtMoney(-plan.freeUntilPayday)} over plan right now — go easy until payday.`
            : `${fmtMoney(wishPlan.freeForWishes)} of this can go to wishes — the other half stays protected for daily life.`}
        </Text>
      </LinearGradient>

      {/* ——— Savings challenge ——— */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Savings challenge</Text>
      </View>

      {lastResult && !challenge && (
        <View style={styles.resultCard}>
          <View style={[styles.iconTile, { backgroundColor: colors.greenBgSoft }]}>
            <Trophy size={21} color={colors.greenDark} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>
              Last cycle: saved {fmtMoney(lastResult.saved)} of {fmtMoney(lastResult.target)}
            </Text>
            <Text style={styles.resultSub}>
              {lastResult.saved >= lastResult.target
                ? 'Challenge crushed — it’s all in your savings pot. 🎉'
                : lastResult.saved > 0
                  ? 'Every bit banked counts. Ready for another round?'
                  : 'Didn’t stick this time — new cycle, fresh start.'}
            </Text>
          </View>
        </View>
      )}

      {challenge ? (
        <Pressable
          style={styles.challengeCard}
          onLongPress={() =>
            confirmAction(
              'Stop the challenge?',
              challenge.mode === 'lock'
                ? `${fmtMoney(challenge.target)} moves from the savings pot back to your balance.`
                : 'The reserved amount goes back into your spendable money.',
              cancelChallenge,
            )
          }>
          <View style={styles.challengeHead}>
            <View style={[styles.iconTile, { backgroundColor: colors.greenBgSoft }]}>
              {challenge.mode === 'lock' ? (
                <LockSimple size={21} color={colors.greenDark} weight="fill" />
              ) : (
                <ShieldCheck size={21} color={colors.greenDark} weight="fill" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeTitle}>
                Save {fmtMoney(challenge.target)} this cycle
              </Text>
              <Text style={styles.challengeSub}>
                {challenge.mode === 'lock'
                  ? 'Locked in your savings pot'
                  : progress!.onTrack
                    ? 'Fully protected — on track'
                    : `${fmtMoney(progress!.protectedAmount)} of ${fmtMoney(challenge.target)} still protected`}
              </Text>
            </View>
            <Text style={styles.challengePct}>{progress!.pct}%</Text>
          </View>

          <View style={styles.progTrack}>
            <View
              style={[
                styles.progFill,
                {
                  width: `${progress!.pct}%`,
                  backgroundColor: progress!.onTrack ? colors.green : colors.red,
                },
              ]}
            />
          </View>

          <Text style={styles.challengeMsg}>“{challengeMessage}”</Text>

          <View style={styles.strategyBox}>
            <Text style={styles.strategyTitle}>Your strategy</Text>
            <Text style={styles.strategyRow}>
              · Spend at most {fmtMoney(plan.dailyBudget)}/day for the next {plan.daysToPayday}{' '}
              day{plan.daysToPayday === 1 ? '' : 's'}
            </Text>
            {plan.reserved.bills > 0 && (
              <Text style={styles.strategyRow}>
                · Keep {fmtMoney(plan.reserved.bills)} untouched for unpaid bills
              </Text>
            )}
            {plan.reserved.debt > 0 && (
              <Text style={styles.strategyRow}>
                · Keep {fmtMoney(plan.reserved.debt)} for this month’s debt payments
              </Text>
            )}
            <Text style={styles.strategyRow}>
              {challenge.mode === 'lock'
                ? `· Your ${fmtMoney(challenge.target)} is already in the pot — nothing else to do`
                : `· Stay under budget and ${fmtMoney(challenge.target)} moves to your savings pot on payday`}
            </Text>
          </View>
          <Text style={styles.hint}>Hold to stop the challenge</Text>
        </Pressable>
      ) : (
        <View style={styles.setupCard}>
          <View style={styles.challengeHead}>
            <View style={[styles.iconTile, { backgroundColor: colors.blueBgSoft }]}>
              <PiggyBank size={21} color={colors.blue} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeTitle}>How much will you save this cycle?</Text>
              <Text style={styles.challengeSub}>
                Pocket will plan your daily budget around it.
              </Text>
            </View>
          </View>

          <View style={styles.targetRow}>
            <TextInput
              value={targetDraft ?? defaultTarget}
              onChangeText={setTargetDraft}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
              style={styles.targetInput}
            />
            <Text style={styles.targetCurrency}>{currencySymbol()}</Text>
          </View>

          <Pressable
            style={[styles.modeRow, mode === 'reserve' && styles.modeRowActive]}
            onPress={() => setMode('reserve')}>
            <ShieldCheck
              size={18}
              color={mode === 'reserve' ? colors.green : colors.textMuted}
              weight="fill"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.modeTitle}>Reserve & track</Text>
              <Text style={styles.modeSub}>
                Stays in your balance but protected — banked into savings on payday.
              </Text>
            </View>
            <View style={[styles.radio, mode === 'reserve' && styles.radioActive]} />
          </Pressable>
          <Pressable
            style={[styles.modeRow, mode === 'lock' && styles.modeRowActive]}
            onPress={() => setMode('lock')}>
            <LockSimple
              size={18}
              color={mode === 'lock' ? colors.green : colors.textMuted}
              weight="fill"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.modeTitle}>Lock it away now</Text>
              <Text style={styles.modeSub}>
                Moves into the savings pot immediately — pay yourself first.
              </Text>
            </View>
            <View style={[styles.radio, mode === 'lock' && styles.radioActive]} />
          </Pressable>

          <Pressable
            disabled={!targetValid}
            style={[styles.startBtn, !targetValid && { opacity: 0.5 }]}
            onPress={() => targetValid && setChallenge(targetValue, mode)}>
            <Text style={styles.startBtnText}>Start the challenge</Text>
          </Pressable>
        </View>
      )}

      {/* ——— Salary day ——— */}
      <View style={styles.salaryCard}>
        <View style={[styles.iconTile, { backgroundColor: colors.blueBgSoft }]}>
          <CalendarDots size={21} color={colors.blue} weight="fill" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.salaryTitle}>
            Next salary {niceDate(plan.nextPaydayDate)}
            <Text style={styles.salaryDays}> · in {plan.daysToPayday} day{plan.daysToPayday === 1 ? '' : 's'}</Text>
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
        Reserved until payday: bills {fmtMoney(plan.reserved.bills)} · debt{' '}
        {fmtMoney(plan.reserved.debt)}
        {plan.reserved.challenge > 0 ? ` · challenge ${fmtMoney(plan.reserved.challenge)}` : ''} ·
        daily life {fmtMoney(wishPlan.reserved.dailyLife)}
      </Text>

      {/* ——— Wishlist ——— */}
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
            const ok = w.price <= wishPlan.freeForWishes;
            const stretch = !ok && w.price <= Math.max(0, wishPlan.freeUntilPayday);
            const funded =
              w.price > 0
                ? Math.max(0, Math.min(100, Math.round((wishPlan.freeForWishes / w.price) * 100)))
                : 100;
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
                      ? `You can buy this — ${fmtMoney(wishPlan.freeForWishes - w.price)} of wish money left over`
                      : stretch
                        ? 'Possible, but it would eat the money protected for daily life'
                        : `Short by ${fmtMoney(w.price - wishPlan.freeForWishes)} — easier after payday in ${wishPlan.daysToSalary} day${wishPlan.daysToSalary === 1 ? '' : 's'}`}
                  </Text>
                </View>
                {stretch && (
                  <View style={styles.planRow}>
                    <Lightning size={14} color={colors.blue} weight="fill" />
                    <Text style={styles.planText}>
                      Safer in {wishPlan.daysToSalary} day{wishPlan.daysToSalary === 1 ? '' : 's'}{' '}
                      when your salary lands — or grab it now and live very lean until then.
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
          <Text style={styles.hint}>Hold a wish to remove it</Text>
        </View>
      )}

      {/* ——— Boosters ——— */}
      {transactions.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Boost your goals</Text>
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
                Every day without spending leaves about {fmtMoney(plan.dailyBudget)} extra for
                your challenge and wishes.
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

  resultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  resultTitle: { ...type.rowTitle, color: colors.textPrimary },
  resultSub: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 2, lineHeight: 17 },

  challengeCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
  },
  setupCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
  },
  challengeHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeTitle: { ...type.rowTitle, color: colors.textPrimary },
  challengeSub: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 1 },
  challengePct: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.textPrimary },
  progTrack: {
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.track,
    marginTop: 13,
    overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: 5 },
  challengeMsg: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
  strategyBox: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  strategyTitle: { ...type.smallLabel, color: colors.textMuted, marginBottom: 5 },
  strategyRow: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 13,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    marginTop: 13,
  },
  targetInput: {
    flex: 1,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.textPrimary,
    paddingVertical: 10,
    padding: 0,
  },
  targetCurrency: { ...type.smallLabel, color: colors.textMuted },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 9,
  },
  modeRowActive: { borderColor: colors.green, backgroundColor: colors.greenBgSoft },
  modeTitle: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.textPrimary },
  modeSub: { ...type.rowSubtitle, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  radioActive: { borderColor: colors.green, backgroundColor: colors.green },
  startBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 13,
  },
  startBtnText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.white },

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
