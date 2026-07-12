import { CaretDown, Check, X } from 'phosphor-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CURRENCIES, getRegion, REGIONS } from '@/data/currencies';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

interface Props {
  label: string;
  /** Selected region key (e.g. "MA"). */
  value: string;
  onChange: (regionKey: string) => void;
}

/** Region select field: shows flag + country + currency, opens a modal list. */
export function RegionPicker({ label, value, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = getRegion(value);
  const selectedCurrency = CURRENCIES[selected.currency];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.flag}>{selected.flag}</Text>
        <Text style={styles.fieldText} numberOfLines={1}>
          {selected.label}
        </Text>
        <Text style={styles.currencyHint}>
          {selectedCurrency.code} · {selectedCurrency.symbol}
        </Text>
        <CaretDown size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Where do you live?</Text>
              <Pressable style={styles.closeBtn} onPress={() => setOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.sheetSubtitle}>
              Pocket uses your region to pick the right currency.
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
              {REGIONS.map((region) => {
                const currency = CURRENCIES[region.currency];
                const isSelected = region.key === selected.key;
                return (
                  <Pressable
                    key={region.key}
                    style={[styles.row, isSelected && styles.rowSelected]}
                    onPress={() => {
                      onChange(region.key);
                      setOpen(false);
                    }}>
                    <Text style={styles.flag}>{region.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{region.label}</Text>
                      <Text style={styles.rowCurrency}>
                        {currency.label} ({currency.symbol})
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={colors.green} weight="bold" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { ...type.smallLabel, color: colors.textBody, marginLeft: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  flag: { fontSize: 18 },
  fieldText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  currencyHint: { ...type.rowSubtitle, color: colors.textMuted },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,38,29,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { ...type.screenTitle, color: colors.textPrimary },
  sheetSubtitle: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  rowSelected: { backgroundColor: colors.greenBgSoft },
  rowLabel: { ...type.rowTitle, color: colors.textPrimary },
  rowCurrency: { ...type.rowSubtitle, color: colors.textMuted },
});
