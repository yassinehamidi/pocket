import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Backspace,
  CheckCircle,
  NotePencil,
  Plus,
  X,
} from 'phosphor-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategorySheet } from '@/components/CategorySheet';
import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PocketPop } from '@/components/PocketPop';
import { getCategory } from '@/data/categories';
import { niceDate, todayISO } from '@/lib/dates';
import { currencySymbol } from '@/lib/format';
import { Category, CategoryKey, TransactionType } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'] as const;

export default function AddScreen() {
  const colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const categories = useFinanceStore((s) => s.categories);

  const [txType, setTxType] = useState<TransactionType>('out');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState<CategoryKey>('food');
  const [reason, setReason] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const isOut = txType === 'out';
  const kind = isOut ? ('expense' as const) : ('income' as const);
  const chips = categories.filter((c) => c.kind === kind);

  const switchType = (t: TransactionType) => {
    setTxType(t);
    const first = categories.find((c) => c.kind === (t === 'out' ? 'expense' : 'income'));
    setCategory(first?.key ?? '');
  };

  const press = (key: string) => {
    setAmount((a) => {
      if (key === 'back') {
        const next = a.slice(0, -1);
        return next === '' ? '0' : next;
      }
      if (key === '.') return a.includes('.') ? a : `${a}.`;
      if (a === '0') return key;
      if (a.replace('.', '').length >= 7) return a;
      return a + key;
    });
  };

  const save = () => {
    const amt = parseFloat(amount) || 0;
    if (amt > 0) {
      addTransaction({
        type: txType,
        amount: amt,
        category,
        reason: reason.trim() || getCategory(categories, category).label,
        date: todayISO(),
      });
    }
    dismissScreen(router);
  };

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Add transaction</Text>
        <Pressable style={styles.closeBtn} onPress={() => dismissScreen(router)}>
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => switchType('out')}
          style={[styles.segmentBtn, isOut && styles.segmentBtnActive]}>
          <ArrowDownLeft size={16} color={isOut ? colors.red : colors.textMuted} />
          <Text style={[styles.segmentText, { color: isOut ? colors.red : colors.textMuted }]}>
            Expense
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchType('in')}
          style={[styles.segmentBtn, !isOut && styles.segmentBtnActive]}>
          <ArrowUpRight size={16} color={!isOut ? colors.green : colors.textMuted} />
          <Text style={[styles.segmentText, { color: !isOut ? colors.green : colors.textMuted }]}>
            Income
          </Text>
        </Pressable>
      </View>

      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: isOut ? colors.red : colors.green }]}>
          {isOut ? '-' : '+'}
          {amount} <Text style={styles.amountUnit}>{currencySymbol()}</Text>
        </Text>
        <Text style={styles.amountDate}>Today · {niceDate(todayISO())}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {chips.map((cat) => {
          const selected = cat.key === category;
          return (
            <Pressable
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              onLongPress={() => {
                setEditingCat(cat);
                setSheetOpen(true);
              }}
              style={[
                styles.chip,
                selected && { borderColor: cat.color, backgroundColor: `${cat.color}1f` },
              ]}>
              <PhosphorIcon
                name={cat.icon}
                size={21}
                color={selected ? cat.color : colors.textBody}
              />
              <Text
                style={[styles.chipLabel, { color: selected ? cat.color : colors.textBody }]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => {
            setEditingCat(null);
            setSheetOpen(true);
          }}
          style={[styles.chip, styles.chipAdd]}>
          <Plus size={21} color={colors.textMuted} />
          <Text style={[styles.chipLabel, { color: colors.textMuted }]}>New</Text>
        </Pressable>
      </ScrollView>
      <Text style={styles.chipHint}>Hold a category to change its color or icon</Text>

      <View style={styles.reasonCard}>
        <NotePencil size={19} color={colors.textMuted} />
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="What was it for?"
          placeholderTextColor={colors.textMuted}
          style={styles.reasonInput}
        />
      </View>

      <View style={styles.keypad}>
        {KEYS.map((key) => (
          <Pressable key={key} style={styles.key} onPress={() => press(key)}>
            {key === 'back' ? (
              <Backspace size={22} color={colors.textPrimary} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={save}>
        <LinearGradient
          colors={['#22a860', '#158a4c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveBtn}>
          <CheckCircle size={20} color={colors.white} />
          <Text style={styles.saveText}>Save transaction</Text>
        </LinearGradient>
      </Pressable>

      <CategorySheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        kind={kind}
        editing={editingCat}
        onSaved={(key) => setCategory(key)}
      />
    </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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

  segment: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.segmentBg,
    borderRadius: 16,
    padding: 5,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 13,
  },
  segmentBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { ...type.statValue },

  amountWrap: { alignItems: 'center', marginTop: 22, marginBottom: 16 },
  amount: { ...type.addAmount },
  amountUnit: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.textMuted },
  amountDate: { ...type.smallLabel, color: colors.textMuted, marginTop: 2 },

  chipsRow: { gap: 10, paddingVertical: 2, paddingHorizontal: 2, paddingBottom: 6 },
  chip: {
    alignItems: 'center',
    gap: 7,
    minWidth: 66,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.card,
  },
  chipAdd: { borderStyle: 'dashed', borderColor: colors.dashedBorder },
  chipLabel: { ...type.tinyLabel },
  chipHint: {
    ...type.rowSubtitle,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  reasonCard: {
    marginTop: 12,
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
  reasonInput: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  key: {
    width: '32%',
    flexGrow: 1,
    flexBasis: '30%',
    height: 50,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: fonts.extraBold, fontSize: 21, color: colors.textPrimary },

  saveBtn: {
    marginTop: 12,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#158a4c',
    shadowOpacity: 0.65,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  saveText: { ...type.sectionTitle, color: colors.white },
}));
