import { StyleSheet, Text, View } from 'react-native';

import { PhosphorIcon } from '@/components/PhosphorIcon';
import { getCategory } from '@/data/categories';
import { friendlyDate } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import { Transaction } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

interface Props {
  tx: Transaction;
  /** Hide the date part of the subtitle (Daily screen shows category only). */
  showDate?: boolean;
}

export function TransactionRow({ tx, showDate = true }: Props) {
  // Subscribed so amounts re-format when the user changes region/currency.
  useFinanceStore((s) => s.settings.currency);
  const colors = useColors();
  const styles = useStyles();
  const categories = useFinanceStore((s) => s.categories);
  const cat = getCategory(categories, tx.category);
  const isOut = tx.type === 'out';
  return (
    <View style={styles.row}>
      <View style={[styles.iconTile, { backgroundColor: `${cat.color}1f` }]}>
        <PhosphorIcon name={cat.icon} size={20} color={cat.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.reason}
        </Text>
        <Text style={styles.subtitle}>
          {cat.label}
          {showDate ? ` · ${friendlyDate(tx.date)}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isOut ? colors.red : colors.green }]}>
        {isOut ? '-' : '+'}
        {fmtMoney(tx.amount)}
      </Text>
    </View>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.greenIconTileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  title: { ...type.rowTitle, color: colors.textPrimary },
  subtitle: { ...type.rowSubtitle, color: colors.textMuted },
  amount: { ...type.subsectionTitle },
}));
