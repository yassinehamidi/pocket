import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bank,
  CalendarDots,
  CheckCircle,
  Minus,
  PencilSimple,
  PiggyBank,
  Plus,
  SunHorizon,
} from 'phosphor-react-native';
import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PocketPop } from '@/components/PocketPop';
import { confirmAction } from '@/lib/confirm';
import { fmtMoney } from '@/lib/format';
import { monthISO } from '@/lib/dates';
import { getDailyBudget, getMonthlyAvailable, getTotalBills } from '@/lib/selectors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

function StepperCard({
  icon,
  label,
  amount,
  onMinus,
  onPlus,
  onSet,
}: {
  icon: ReactNode;
  label: string;
  amount: number;
  onMinus: () => void;
  onPlus: () => void;
  /** Called with the typed value when the amount is edited directly. */
  onSet: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEditing = () => {
    setDraft(amount > 0 ? String(amount) : '');
    setEditing(true);
  };

  const commit = () => {
    const value = parseFloat(draft);
    if (!isNaN(value) && value >= 0) onSet(Math.round(value));
    setEditing(false);
  };

  return (
    <View style={styles.stepperCard}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={styles.stepperLabel}>{label}</Text>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            onBlur={commit}
            onSubmitEditing={commit}
            style={styles.stepperInput}
          />
        ) : (
          <Pressable style={styles.stepperValueRow} onPress={startEditing}>
            <Text style={styles.stepperValue}>{fmtMoney(amount)}</Text>
            <PencilSimple size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      <View style={styles.stepperBtns}>
        <Pressable style={styles.minusBtn} onPress={onMinus}>
          <Minus size={16} color={colors.textSecondary} weight="bold" />
        </Pressable>
        <Pressable style={styles.plusBtn} onPress={onPlus}>
          <Plus size={16} color={colors.white} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bills = useFinanceStore((s) => s.bills);
  const debts = useFinanceStore((s) => s.debts);
  const settings = useFinanceStore((s) => s.settings);
  const adjustSalary = useFinanceStore((s) => s.adjustSalary);
  const adjustSavingsGoal = useFinanceStore((s) => s.adjustSavingsGoal);
  const setSalary = useFinanceStore((s) => s.setSalary);
  const setSavingsGoal = useFinanceStore((s) => s.setSavingsGoal);
  const removeBill = useFinanceStore((s) => s.removeBill);
  const removeDebt = useFinanceStore((s) => s.removeDebt);
  const toggleBillPaid = useFinanceStore((s) => s.toggleBillPaid);
  const recordDebtPayment = useFinanceStore((s) => s.recordDebtPayment);
  const thisMonth = monthISO();

  const monthlyAvailable = getMonthlyAvailable(settings, bills, debts);
  const dailyBudget = getDailyBudget(settings, bills, debts);
  const totalBills = getTotalBills(bills);

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Budget &amp; Debt</Text>

      <LinearGradient
        colors={colors.greenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.availableCard}>
        <View style={styles.deco} />
        <Text style={styles.availableLabel}>You can spend this month</Text>
        <Text style={styles.availableValue}>{fmtMoney(monthlyAvailable)}</Text>
        <View style={styles.perDayPill}>
          <SunHorizon size={17} color={colors.white} weight="fill" />
          <Text style={styles.perDayText}>
            {fmtMoney(dailyBudget)} <Text style={styles.perDaySuffix}>/ day</Text>
          </Text>
        </View>
        <Text style={styles.availableNote}>
          Salary − bills − debt − savings, spread over 31 days.
        </Text>
      </LinearGradient>

      <StepperCard
        icon={
          <View style={[styles.controlIconTile, { backgroundColor: colors.greenBgSoft }]}>
            <Bank size={21} color={colors.greenDark} weight="fill" />
          </View>
        }
        label="Monthly salary"
        amount={settings.salary}
        onMinus={() => adjustSalary(-500)}
        onPlus={() => adjustSalary(500)}
        onSet={setSalary}
      />

      <StepperCard
        icon={
          <View style={[styles.controlIconTile, { backgroundColor: colors.blueBgSoft }]}>
            <PiggyBank size={21} color={colors.blue} weight="fill" />
          </View>
        }
        label="Savings goal"
        amount={settings.savingsGoal}
        onMinus={() => adjustSavingsGoal(-100)}
        onPlus={() => adjustSavingsGoal(100)}
        onSet={setSavingsGoal}
      />

      <View style={styles.billsCard}>
        <View style={styles.billsHeader}>
          <Text style={styles.billsTitle}>Fixed bills</Text>
          <View style={styles.billsHeaderRight}>
            {bills.length > 0 && <Text style={styles.billsTotal}>{fmtMoney(totalBills)}</Text>}
            <Pressable style={styles.addSmallBtn} onPress={() => router.push('/new-bill')}>
              <Plus size={14} color={colors.white} weight="bold" />
            </Pressable>
          </View>
        </View>
        {bills.length === 0 ? (
          <Text style={styles.emptyInline}>
            No bills yet — add rent, internet, phone… so Pocket can plan your daily budget.
          </Text>
        ) : (
          <View style={styles.billsList}>
            {bills.map((b) => {
              const paid = b.lastPaidMonth === thisMonth;
              return (
                <Pressable
                  key={b.id}
                  style={styles.billRow}
                  onPress={() => toggleBillPaid(b.id)}
                  onLongPress={() =>
                    confirmAction('Remove bill?', `Delete "${b.name}" from your fixed bills.`, () =>
                      removeBill(b.id),
                    )
                  }>
                  <View style={styles.billName}>
                    {paid ? (
                      <CheckCircle size={16} color={colors.green} weight="fill" />
                    ) : (
                      <PhosphorIcon name={b.icon} size={16} color={colors.textMuted} />
                    )}
                    <Text style={[styles.billNameText, paid && styles.billNamePaid]}>
                      {b.name}
                    </Text>
                  </View>
                  <Text style={[styles.billAmount, paid && styles.billNamePaid]}>
                    {fmtMoney(b.amount)}
                  </Text>
                </Pressable>
              );
            })}
            <Text style={styles.hint}>Tap a bill to mark it paid · hold to remove</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your debts</Text>
        <Pressable style={styles.addSmallBtn} onPress={() => router.push('/new-debt')}>
          <Plus size={14} color={colors.white} weight="bold" />
        </Pressable>
      </View>
      {debts.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No debts — nice! If you have a loan or credit to pay off, add it here and Pocket
            will set the monthly payment aside.
          </Text>
        </View>
      )}
      <View style={styles.debtList}>
        {debts.map((d) => {
          const pctLeft =
            d.originalTotal > 0 ? Math.round((d.total / d.originalTotal) * 100) : 100;
          return (
            <Pressable
              key={d.id}
              style={styles.debtCard}
              onPress={() =>
                d.total > 0 &&
                confirmAction(
                  'Record payment?',
                  `Reduce "${d.name}" by ${fmtMoney(d.monthly)} (this month's payment).`,
                  () => recordDebtPayment(d.id),
                )
              }
              onLongPress={() =>
                confirmAction('Remove debt?', `Delete "${d.name}" from your debts.`, () =>
                  removeDebt(d.id),
                )
              }>
              <View style={styles.debtRow}>
                <View style={styles.debtIconTile}>
                  <PhosphorIcon name={d.icon} size={21} color={colors.redDark} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.debtName}>{d.name}</Text>
                  <Text style={styles.debtRemaining}>
                    {d.total > 0 ? `Remaining ${fmtMoney(d.total)}` : 'Paid off 🎉'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.debtMonthly}>{fmtMoney(d.monthly)}</Text>
                  <Text style={styles.debtPerMonth}>/ month</Text>
                </View>
              </View>
              <View style={styles.debtTrack}>
                <View style={[styles.debtFill, { width: `${100 - pctLeft}%` }]} />
              </View>
              <View style={styles.debtFooter}>
                <CalendarDots size={15} color={colors.textBody} />
                <Text style={styles.debtMonthsLeft}>
                  {d.total > 0
                    ? `${d.monthsLeft} months left · ${pctLeft}% to go`
                    : `was ${fmtMoney(d.originalTotal)}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
        {debts.length > 0 && (
          <Text style={styles.hint}>Tap a debt to record a payment · hold to remove</Text>
        )}
      </View>
    </ScrollView>
    </PocketPop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: {
    ...type.screenTitle,
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 14,
    marginHorizontal: 2,
  },

  availableCard: {
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
  availableLabel: { ...type.cardLabel, color: colors.white, opacity: 0.9 },
  availableValue: { ...type.bigFigure, color: colors.white, marginTop: 4 },
  perDayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  perDayText: { ...type.statValue, color: colors.white },
  perDaySuffix: { fontFamily: fonts.bold, opacity: 0.8 },
  availableNote: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.white,
    opacity: 0.85,
    marginTop: 14,
  },

  stepperCard: {
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
  },
  controlIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: { ...type.smallLabel, color: colors.textMuted },
  stepperValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepperValue: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.textPrimary },
  stepperInput: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.textPrimary,
    padding: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.green,
    minWidth: 110,
    alignSelf: 'flex-start',
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

  billsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
  },
  billsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  billsHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  billsTitle: { ...type.cardLabel, color: colors.textPrimary },
  billsTotal: { ...type.sectionTitle, color: colors.textPrimary },
  addSmallBtn: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInline: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 10, lineHeight: 18 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    borderRadius: 20,
    padding: 20,
  },
  emptyText: { ...type.rowSubtitle, color: colors.textMuted, lineHeight: 18 },
  hint: { ...type.rowSubtitle, color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  billsList: { gap: 9, marginTop: 12 },
  billRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  billName: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  billNameText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  billNamePaid: { color: colors.textMuted, textDecorationLine: 'line-through' },
  billAmount: { ...type.cardLabel, color: colors.textPrimary },

  sectionTitle: { ...type.subsectionTitle, color: colors.textPrimary },
  debtList: { gap: 11 },
  debtCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  debtIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.redBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtName: { ...type.subsectionTitle, color: colors.textPrimary },
  debtRemaining: { ...type.rowSubtitle, color: colors.textMuted },
  debtMonthly: { ...type.subsectionTitle, color: colors.red },
  debtPerMonth: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.textMuted },
  debtTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: 12,
    overflow: 'hidden',
  },
  debtFill: { height: '100%', borderRadius: 4, backgroundColor: colors.green },
  debtFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  debtMonthsLeft: { ...type.smallLabel, color: colors.textBody },
});
