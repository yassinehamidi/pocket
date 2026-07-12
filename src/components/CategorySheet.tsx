import { Check, X } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { PhosphorIcon } from '@/components/PhosphorIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/data/categories';
import { Category } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Kind for newly created categories (ignored when editing). */
  kind: 'expense' | 'income';
  /** When set, the sheet edits this category instead of creating one. */
  editing?: Category | null;
  /** Called with the category key after a successful save. */
  onSaved?: (key: string) => void;
}

/** Bottom sheet for creating or editing a category: name, icon, and color. */
export function CategorySheet({ visible, onClose, kind, editing, onSaved }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useStyles();
  const addCategory = useFinanceStore((s) => s.addCategory);
  const updateCategory = useFinanceStore((s) => s.updateCategory);

  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState<string>('tag');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setLabel(editing?.label ?? '');
      setIcon(editing?.icon ?? 'tag');
      setColor(editing?.color ?? CATEGORY_COLORS[0]);
      setError('');
    }
  }, [visible, editing]);

  const save = () => {
    if (!label.trim()) {
      setError('Give the category a name');
      return;
    }
    let key: string;
    if (editing) {
      updateCategory(editing.key, { label: label.trim(), icon, color });
      key = editing.key;
    } else {
      key = addCategory({ label: label.trim(), icon, color, kind });
    }
    onSaved?.(key);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{editing ? 'Edit category' : 'New category'}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
            <View style={styles.previewRow}>
              <View style={[styles.previewTile, { backgroundColor: `${color}1f` }]}>
                <PhosphorIcon name={icon} size={26} color={color} />
              </View>
            </View>

            <FormField
              label="Name"
              value={label}
              onChangeText={(v) => {
                setLabel(v);
                if (error) setError('');
              }}
              placeholder="Coffee, Pets, Gym…"
              error={error}
            />

            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.grid}>
              {CATEGORY_ICONS.map((key) => {
                const selected = key === icon;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setIcon(key)}
                    style={[
                      styles.iconChip,
                      selected && { borderColor: color, backgroundColor: `${color}1f` },
                    ]}>
                    <PhosphorIcon
                      name={key}
                      size={20}
                      color={selected ? color : colors.textBody}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.grid}>
              {CATEGORY_COLORS.map((c) => {
                const selected = c === color;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[styles.swatch, { backgroundColor: c }, selected && styles.swatchSelected]}>
                    {selected && <Check size={16} color="#ffffff" weight="bold" />}
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 20 }}>
              <PrimaryButton label={editing ? 'Save changes' : 'Add category'} onPress={save} />
            </View>
          </ScrollView>
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
    maxHeight: '85%',
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

  previewRow: { alignItems: 'center', marginBottom: 16 },
  previewTile: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    ...type.smallLabel,
    color: colors.textBody,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 2.5,
    borderColor: colors.textPrimary,
  },
}));
