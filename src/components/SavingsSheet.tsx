import { ArrowCircleDown, ArrowCircleUp, PiggyBank, X } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { fmtMoney } from '@/lib/format';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Current spendable balance (deposits are capped to it). */
  available: number;
  /** Current savings pot total (withdrawals are capped to it). */
  saved: number;
}

/** Bottom sheet to move money between the balance and the savings pot. */
export function SavingsSheet({ visible, onClose, available, saved }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useStyles();
  const depositSavings = useFinanceStore((s) => s.depositSavings);
  const withdrawSavings = useFinanceStore((s) => s.withdrawSavings);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setError('');
    }
  }, [visible]);

  const parse = (): number | null => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Enter an amount above 0');
      return null;
    }
    return value;
  };

  const deposit = () => {
    const value = parse();
    if (value === null) return;
    if (value > available) {
      setError(`You only have ${fmtMoney(available)} available`);
      return;
    }
    depositSavings(value);
    onClose();
  };

  const withdraw = () => {
    const value = parse();
    if (value === null) return;
    if (value > saved) {
      setError(`Only ${fmtMoney(saved)} is saved`);
      return;
    }
    withdrawSavings(value);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <PiggyBank size={22} color={colors.blue} weight="fill" />
              <Text style={styles.title}>Savings</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Saved</Text>
              <Text style={[styles.statValue, { color: colors.blue }]}>{fmtMoney(saved)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValue}>{fmtMoney(available)}</Text>
            </View>
          </View>

          <FormField
            label="Amount"
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              if (error) setError('');
            }}
            placeholder="0"
            keyboardType="numeric"
            error={error}
          />

          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, { backgroundColor: colors.blue }]} onPress={deposit}>
              <ArrowCircleDown size={18} color={colors.white} weight="fill" />
              <Text style={styles.btnText}>Save it</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnOutline]}
              onPress={withdraw}>
              <ArrowCircleUp size={18} color={colors.blue} weight="fill" />
              <Text style={[styles.btnText, { color: colors.blue }]}>Take back</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,38,29,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
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

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabel: { ...type.smallLabel, color: colors.textMuted },
  statValue: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.textPrimary, marginTop: 2 },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 50,
    borderRadius: 16,
  },
  btnOutline: {
    backgroundColor: colors.blueBgSoft,
  },
  btnText: { ...type.sectionTitle, color: colors.white },
}));
