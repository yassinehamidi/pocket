import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import { Coins, Receipt, X } from 'phosphor-react-native';
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
import { currencySymbol } from '@/lib/format';
import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PocketPop } from '@/components/PocketPop';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';

const BILL_ICONS = ['house', 'lightning', 'wifi-high', 'device-mobile', 'receipt'] as const;

export default function NewBillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addBill = useFinanceStore((s) => s.addBill);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState<string>('receipt');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const next: Record<string, string> = {};
    const value = parseFloat(amount);
    if (!name.trim()) next.name = 'Give the bill a name';
    if (isNaN(value) || value <= 0) next.amount = 'Enter an amount above 0';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    addBill({ name: name.trim(), amount: value, icon });
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
          <Text style={styles.title}>New fixed bill</Text>
          <Pressable style={styles.closeBtn} onPress={() => dismissScreen(router)}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Rent, Internet, Phone…"
            icon={<Receipt size={18} color={colors.textMuted} />}
            error={errors.name}
          />
          <FormField
            label={`Amount per month (${currencySymbol()})`}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            icon={<Coins size={18} color={colors.textMuted} />}
            error={errors.amount}
          />

          <Text style={styles.iconLabel}>Icon</Text>
          <View style={styles.iconRow}>
            {BILL_ICONS.map((key) => {
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

        <PrimaryButton label="Add bill" onPress={save} />
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
