import { Confetti } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { lastSalaryISO, salaryCycleISO } from '@/lib/dates';
import { niceDate } from '@/lib/dates';
import { currencySymbol } from '@/lib/format';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

/**
 * Shown on Home from payday until the user confirms (or skips) that the
 * salary actually arrived. Confirming records the income — the salary never
 * counts toward the balance on faith alone.
 */
export function SalaryConfirmCard() {
  const colors = useColors();
  const styles = useStyles();
  const settings = useFinanceStore((s) => s.settings);
  const transactions = useFinanceStore((s) => s.transactions);
  const skippedCycle = useFinanceStore((s) => s.skippedSalaryCycle);
  const confirmSalary = useFinanceStore((s) => s.confirmSalary);
  const skipSalary = useFinanceStore((s) => s.skipSalary);
  const [draft, setDraft] = useState<string | null>(null);

  const cycle = salaryCycleISO(settings.salaryDay);
  const confirmed = transactions.some((t) => t.id === `salary-${cycle}`);
  if (settings.salary <= 0 || confirmed || skippedCycle === cycle) return null;

  const payday = lastSalaryISO(settings.salaryDay);
  const amount = draft !== null ? parseFloat(draft) : settings.salary;
  const valid = !isNaN(amount) && amount > 0;

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.iconTile}>
          <Confetti size={21} color={colors.greenDark} weight="fill" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Payday!</Text>
          <Text style={styles.sub}>
            Did your salary arrive on {niceDate(payday)}? Check the amount and add it to your
            balance.
          </Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft ?? String(settings.salary)}
            onChangeText={setDraft}
            keyboardType="numeric"
            selectTextOnFocus
            style={styles.input}
          />
          <Text style={styles.inputCurrency}>{currencySymbol()}</Text>
        </View>
        <Pressable
          disabled={!valid}
          style={[styles.confirmBtn, !valid && { opacity: 0.5 }]}
          onPress={() => valid && confirmSalary(amount)}>
          <Text style={styles.confirmText}>Add to balance</Text>
        </Pressable>
      </View>
      <Pressable onPress={skipSalary} hitSlop={8}>
        <Text style={styles.skipText}>No salary this month — skip</Text>
      </Pressable>
    </View>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.subsectionTitle, color: colors.textPrimary },
  sub: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 2, lineHeight: 17 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 13,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 10,
    padding: 0,
  },
  inputCurrency: { ...type.smallLabel, color: colors.textMuted },
  confirmBtn: {
    backgroundColor: colors.green,
    borderRadius: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontFamily: fonts.extraBold, fontSize: 13.5, color: colors.white },
  skipText: {
    ...type.rowSubtitle,
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 11,
  },
}));
