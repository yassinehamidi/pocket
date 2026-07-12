import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import { CalendarDots, Coins, CreditCard, X } from 'phosphor-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PocketPop } from '@/components/PocketPop';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fmtDH } from '@/lib/format';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';

const DEBT_ICONS = ['car', 'credit-card', 'house', 'bank'] as const;

export default function NewDebtScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addDebt = useFinanceStore((s) => s.addDebt);

  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [icon, setIcon] = useState<string>('credit-card');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalValue = parseFloat(total);
  const monthlyValue = parseFloat(monthly);
  const monthsLeft =
    !isNaN(totalValue) && !isNaN(monthlyValue) && monthlyValue > 0
      ? Math.ceil(totalValue / monthlyValue)
      : null;

  const save = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Give the debt a name';
    if (isNaN(totalValue) || totalValue <= 0) next.total = 'Enter the remaining amount';
    if (isNaN(monthlyValue) || monthlyValue <= 0) next.monthly = 'Enter your monthly payment';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    addDebt({ name: name.trim(), total: totalValue, monthly: monthlyValue, icon });
    dismissScreen(router);
  };

  return (
    <PocketPop>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>New debt</Text>
          <Pressable style={styles.closeBtn} onPress={() => dismissScreen(router)}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Car loan, Credit card…"
            icon={<CreditCard size={18} color={colors.textMuted} />}
            error={errors.name}
          />
          <FormField
            label="Remaining amount (DH)"
            value={total}
            onChangeText={setTotal}
            placeholder="0"
            keyboardType="numeric"
            icon={<Coins size={18} color={colors.textMuted} />}
            error={errors.total}
          />
          <FormField
            label="Monthly payment (DH)"
            value={monthly}
            onChangeText={setMonthly}
            placeholder="0"
            keyboardType="numeric"
            icon={<CalendarDots size={18} color={colors.textMuted} />}
            error={errors.monthly}
          />

          {monthsLeft !== null && (
            <View style={styles.previewPill}>
              <CalendarDots size={15} color={colors.greenDark} />
              <Text style={styles.previewText}>
                Paid off in {monthsLeft} month{monthsLeft === 1 ? '' : 's'} at{' '}
                {fmtDH(monthlyValue)} / month
              </Text>
            </View>
          )}

          <Text style={styles.iconLabel}>Icon</Text>
          <View style={styles.iconRow}>
            {DEBT_ICONS.map((key) => {
              const selected = key === icon;
              return (
                <Pressable
                  key={key}
                  onPress={() => setIcon(key)}
                  style={[styles.iconChip, selected && styles.iconChipSelected]}>
                  <PhosphorIcon
                    name={key}
                    size={22}
                    color={selected ? colors.greenDark : colors.textBody}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton label="Add debt" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
    </PocketPop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 2,
  },
  title: { ...type.screenTitle, color: colors.textPrimary },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: 14, marginBottom: 24 },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: colors.greenBgSoft,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  previewText: { ...type.smallLabel, color: colors.greenDark },
  iconLabel: { ...type.smallLabel, color: colors.textBody, marginLeft: 4 },
  iconRow: { flexDirection: 'row', gap: 10 },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipSelected: { borderColor: colors.green, backgroundColor: colors.greenBgSoft },
});
