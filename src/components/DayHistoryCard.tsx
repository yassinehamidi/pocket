import { CaretDown, CaretUp } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhosphorIcon } from '@/components/PhosphorIcon';
import { getCategory } from '@/data/categories';
import { friendlyDate, weekdayLabel } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import { DayHistory } from '@/lib/selectors';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

interface Props {
  day: DayHistory;
}

/** One documented day in a history list — tap to expand its transactions. */
export function DayHistoryCard({ day }: Props) {
  // Subscribed so amounts re-format when the user changes region/currency.
  useFinanceStore((s) => s.settings.currency);
  const categories = useFinanceStore((s) => s.categories);
  const colors = useColors();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const dayOfMonth = parseInt(day.date.slice(8), 10);
  const count = day.transactions.length;

  return (
    <Pressable style={styles.card} onPress={() => setOpen((v) => !v)}>
      <View style={styles.headerRow}>
        <View style={styles.dateTile}>
          <Text style={styles.dateNum}>{dayOfMonth}</Text>
          <Text style={styles.dateWeekday}>{weekdayLabel(day.date)}</Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.title}>{friendlyDate(day.date)}</Text>
          <Text style={styles.subtitle}>
            {count} transaction{count === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={styles.totals}>
          {day.spent > 0 && (
            <Text style={[styles.totalText, { color: colors.red }]}>
              -{fmtMoney(day.spent)}
            </Text>
          )}
          {day.received > 0 && (
            <Text style={[styles.totalText, { color: colors.green }]}>
              +{fmtMoney(day.received)}
            </Text>
          )}
        </View>
        {open ? (
          <CaretUp size={14} color={colors.textMuted} weight="bold" />
        ) : (
          <CaretDown size={14} color={colors.textMuted} weight="bold" />
        )}
      </View>

      {open && (
        <View style={styles.txList}>
          {day.transactions.map((tx) => {
            const cat = getCategory(categories, tx.category);
            const isOut = tx.type === 'out';
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIconTile, { backgroundColor: `${cat.color}1f` }]}>
                  <PhosphorIcon name={cat.icon} size={16} color={cat.color} />
                </View>
                <View style={styles.txBody}>
                  <Text style={styles.txTitle} numberOfLines={1}>
                    {tx.reason}
                  </Text>
                  <Text style={styles.txSubtitle}>{cat.label}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isOut ? colors.red : colors.green }]}>
                  {isOut ? '-' : '+'}
                  {fmtMoney(tx.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.greenIconTileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNum: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.greenIconTileFg },
  dateWeekday: { fontFamily: fonts.bold, fontSize: 9, color: colors.textMuted },
  headerBody: { flex: 1, minWidth: 0 },
  title: { ...type.rowTitle, color: colors.textPrimary },
  subtitle: { ...type.rowSubtitle, color: colors.textMuted },
  totals: { alignItems: 'flex-end' },
  totalText: { ...type.statValue },

  txList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    gap: 10,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.greenIconTileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txBody: { flex: 1, minWidth: 0 },
  txTitle: { ...type.rowSubtitle, color: colors.textPrimary },
  txSubtitle: { ...type.smallLabel, color: colors.textMuted },
  txAmount: { ...type.cardLabel },
}));
