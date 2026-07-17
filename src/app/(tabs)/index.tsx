import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowCircleDown,
  ArrowCircleUp,
  Coins,
  CreditCard,
  GearSix,
  PiggyBank,
  Plus,
  Receipt,
  Wallet,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PocketPop } from '@/components/PocketPop';
import { SalaryConfirmCard } from '@/components/SalaryConfirmCard';
import { SavingsSheet } from '@/components/SavingsSheet';
import { useTabBarClearance } from '@/components/TabBar';
import { TransactionRow } from '@/components/TransactionRow';
import { currencySymbol, fmtMoney, fmtMoneySigned } from '@/lib/format';
import {
  getBillsLeft,
  getDebtPercentLeft,
  getRecentTransactions,
  getSavedTotal,
  getSpendPlan,
  getWeekTotals,
} from '@/lib/selectors';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabBarClearance();
  const router = useRouter();
  const transactions = useFinanceStore((s) => s.transactions);
  const bills = useFinanceStore((s) => s.bills);
  const debts = useFinanceStore((s) => s.debts);
  const savings = useFinanceStore((s) => s.savings);
  const settings = useFinanceStore((s) => s.settings);
  const challenge = useFinanceStore((s) => s.challenge);
  const settleStaleChallenge = useFinanceStore((s) => s.settleStaleChallenge);
  const accountName = useAuthStore((s) => s.account?.name);
  const displayName = accountName || settings.userName || 'there';
  const [savingsOpen, setSavingsOpen] = useState(false);

  // Bank a finished challenge as soon as the app is opened in a new cycle.
  useEffect(() => {
    settleStaleChallenge();
  }, [settleStaleChallenge]);

  const plan = getSpendPlan(transactions, settings, bills, debts, savings, challenge);
  const balance = plan.balance;
  const saved = getSavedTotal(savings);
  const { weekIn, weekOut } = getWeekTotals(transactions);
  const recent = getRecentTransactions(transactions);
  const billsLeft = getBillsLeft(bills);
  const debtPctLeft = getDebtPercentLeft(debts);
  const hide = settings.privacyMode;

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: tabClearance }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingLabel}>{greetingForNow()}</Text>
          <Text style={styles.greetingName}>Hey, {displayName}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <GearSix size={19} color={colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.avatar} onPress={() => router.push('/account')}>
            <Text style={styles.avatarText}>
              {(displayName[0] ?? '?').toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      <SalaryConfirmCard />

      <LinearGradient
        colors={colors.greenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.balanceCard}>
        <View style={[styles.deco, { top: -40, right: -30, width: 150, height: 150 }]} />
        <View style={[styles.deco, { bottom: -60, right: 20, width: 120, height: 120, opacity: 0.7 }]} />
        <View style={styles.balanceLabelRow}>
          <Wallet size={15} color={colors.white} />
          <Text style={styles.balanceLabel}>Balance</Text>
        </View>
        <Text style={styles.balanceValue}>
          {hide ? `•••• ${currencySymbol()}` : fmtMoney(balance)}
        </Text>

        <View style={styles.cardDivider} />

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <View style={styles.statLabelRow}>
              <ArrowCircleDown size={13} color={colors.white} weight="fill" />
              <Text style={styles.statLabel}>Week in</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {fmtMoney(weekIn)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statLabelRow}>
              <ArrowCircleUp size={13} color={colors.white} weight="fill" />
              <Text style={styles.statLabel}>Week out</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {fmtMoney(weekOut)}
            </Text>
          </View>
          <Pressable style={styles.statBox} onPress={() => setSavingsOpen(true)}>
            <View style={styles.statLabelRow}>
              <PiggyBank size={13} color={colors.white} weight="fill" />
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {hide ? `•••• ${currencySymbol()}` : fmtMoney(saved)}
            </Text>
            <View style={styles.savedManage}>
              <Plus size={11} color={colors.white} weight="bold" />
            </View>
          </Pressable>
        </View>
        {(bills.length > 0 || debtPctLeft !== null) && (
          <View style={styles.metaRow}>
            {bills.length > 0 && (
              <View style={styles.metaChip}>
                <Receipt size={15} color={colors.white} weight="fill" />
                <Text style={styles.metaText}>
                  {billsLeft === 0
                    ? 'All bills paid'
                    : `${billsLeft} of ${bills.length} bills left`}
                </Text>
              </View>
            )}
            {debtPctLeft !== null && (
              <View style={styles.metaChip}>
                <CreditCard size={15} color={colors.white} weight="fill" />
                <Text style={styles.metaText}>
                  {debtPctLeft === 0 ? 'Debt free!' : `${debtPctLeft}% debt left`}
                </Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <View style={styles.safeCard}>
        <View style={styles.safeIconTile}>
          <Coins size={22} color={colors.greenDark} weight="fill" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.safeLabel}>
            {challenge ? 'Safe to spend (goal protected)' : 'Safe to spend today'}
          </Text>
          <Text
            style={[
              styles.safeValue,
              { color: plan.safeToSpendToday >= 0 ? colors.green : colors.red },
            ]}>
            {fmtMoneySigned(plan.safeToSpendToday)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.safeBudgetLabel}>
            per day · {plan.daysToPayday}d to payday
          </Text>
          <Text style={styles.safeBudgetValue}>{fmtMoney(plan.dailyBudget)}</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {recent.length > 0 && <Text style={styles.sectionLink}>See all</Text>}
      </View>
      {recent.length > 0 ? (
        <View style={styles.txList}>
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Receipt size={30} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyBody}>
            Tap the green + button below to add your first expense or income.
          </Text>
        </View>
      )}

      <SavingsSheet
        visible={savingsOpen}
        onClose={() => setSavingsOpen(false)}
        available={balance}
        saved={saved}
      />
    </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 18,
    marginHorizontal: 2,
  },
  greetingLabel: { ...type.cardLabel, color: colors.textMuted },
  greetingName: { ...type.greeting, color: colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...type.sectionTitle, color: colors.greenDark },

  balanceCard: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    overflow: 'hidden',
    shadowColor: '#158a4c',
    shadowOpacity: 0.65,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  deco: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceLabel: { ...type.cardLabel, color: colors.white, opacity: 0.9 },
  balanceValue: { ...type.balance, color: colors.white, marginTop: 6 },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 16 },
  savedManage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 11,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { ...type.tinyLabel, color: colors.white, opacity: 0.9 },
  statValue: { fontFamily: type.statValue.fontFamily, fontSize: 16, color: colors.white, marginTop: 3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metaText: { fontFamily: fonts.extraBold, fontSize: 12.5, color: colors.white },

  safeCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  safeIconTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeLabel: { ...type.smallLabel, color: colors.textMuted },
  safeValue: { fontFamily: type.statValue.fontFamily, fontSize: 21 },
  safeBudgetLabel: { ...type.tinyLabel, color: colors.textMuted },
  safeBudgetValue: { ...type.statValue, color: colors.textPrimary },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  sectionTitle: { ...type.sectionTitle, color: colors.textPrimary },
  sectionLink: { ...type.smallLabel, color: colors.green },
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
  emptyTitle: { ...type.cardLabel, color: colors.textPrimary, marginTop: 8 },
  emptyBody: {
    ...type.rowSubtitle,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
}));
