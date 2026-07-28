import { CalendarDots, X } from 'phosphor-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Currently selected day of month (1–31). */
  value: number;
  onSelect: (day: number) => void;
}

/**
 * Bottom sheet for picking a day of the month — used to fully customize
 * salary day, bill due day, and debt due day by holding a row and choosing
 * an exact date instead of nudging it one day at a time.
 */
export function DayPickerSheet({ visible, onClose, title, subtitle, value, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useStyles();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <CalendarDots size={22} color={colors.blue} weight="fill" />
              <View>
                <Text style={styles.title}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {DAYS.map((day) => {
              const selected = day === value;
              return (
                <Pressable
                  key={day}
                  style={[styles.dayBtn, selected && styles.dayBtnSelected]}
                  onPress={() => {
                    onSelect(day);
                    onClose();
                  }}>
                  <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                </Pressable>
              );
            })}
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
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  title: { ...type.sectionTitle, color: colors.textPrimary },
  subtitle: { ...type.rowSubtitle, color: colors.textMuted, marginTop: 1 },
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  dayBtn: {
    width: '12%',
    aspectRatio: 1,
    minWidth: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnSelected: { backgroundColor: colors.green, borderColor: colors.green },
  dayText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.textSecondary },
  dayTextSelected: { color: colors.white },
}));
