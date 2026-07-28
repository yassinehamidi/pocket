import { Confetti, X } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fmtMoney } from '@/lib/format';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Manual "I got paid today" sheet — available any time, independent of the
 * automatic payday card on Home. Covers salary that arrives early, late, or
 * off-schedule: confirm right now and it's added to the balance today.
 */
export function GotPaidSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useStyles();
  const settings = useFinanceStore((s) => s.settings);
  const logSalaryToday = useFinanceStore((s) => s.logSalaryToday);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount(settings.salary > 0 ? String(settings.salary) : '');
      setError('');
    }
  }, [visible, settings.salary]);

  const submit = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Enter an amount above 0');
      return;
    }
    logSalaryToday(value);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Confetti size={22} color={colors.greenDark} weight="fill" />
              <Text style={styles.title}>Got paid today?</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.note}>
            Add it to your balance right now, dated today — handy if it landed early, late, or
            off your usual schedule.
            {settings.salary > 0 ? ` Usually ${fmtMoney(settings.salary)}.` : ''}
          </Text>

          <FormField
            label="Amount received"
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              if (error) setError('');
            }}
            placeholder="0"
            keyboardType="numeric"
            error={error}
          />

          <PrimaryButton label="Add to balance" onPress={submit} />
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
    marginBottom: 10,
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
  note: { ...type.rowSubtitle, color: colors.textMuted, lineHeight: 18, marginBottom: 16 },
}));
