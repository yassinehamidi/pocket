import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import {
  CaretLeft,
  CircleHalf,
  DownloadSimple,
  EyeSlash,
  Info,
  Moon,
  Sun,
  Trash,
} from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PocketPop } from '@/components/PocketPop';
import { confirmAction } from '@/lib/confirm';
import { ThemeMode } from '@/lib/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { fonts, type } from '@/theme/typography';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: typeof Sun }[] = [
  { key: 'system', label: 'System', icon: CircleHalf },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
];

export default function SettingsScreen() {
  const colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const privacyMode = useFinanceStore((s) => s.settings.privacyMode);
  const setPrivacyMode = useFinanceStore((s) => s.setPrivacyMode);
  const themeMode = useFinanceStore((s) => s.settings.themeMode);
  const setThemeMode = useFinanceStore((s) => s.setThemeMode);
  const loadSampleData = useFinanceStore((s) => s.loadSampleData);
  const eraseAllData = useFinanceStore((s) => s.eraseAllData);
  const hasData = useFinanceStore(
    (s) => s.transactions.length > 0 || s.bills.length > 0 || s.debts.length > 0,
  );

  return (
    <PocketPop>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => dismissScreen(router)}>
          <CaretLeft size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <Text style={styles.sectionLabel}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            const active = themeMode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemeMode(opt.key)}
                style={[styles.themeChip, active && styles.themeChipActive]}>
                <OptIcon
                  size={18}
                  color={active ? colors.greenDark : colors.textBody}
                  weight={active ? 'fill' : 'regular'}
                />
                <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.themeHint}>
          System follows your phone's dark mode automatically.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Privacy</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconTile, { backgroundColor: colors.greenBgSoft }]}>
            <EyeSlash size={20} color={colors.greenDark} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Privacy mode</Text>
            <Text style={styles.rowSubtitle}>Hide your balance on the Home screen</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={setPrivacyMode}
            trackColor={{ false: colors.trackRing, true: colors.green }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Data</Text>
      <View style={styles.card}>
        <Pressable
          style={styles.row}
          onPress={() =>
            confirmAction(
              'Load sample data?',
              'This fills Pocket with example transactions, bills, and debts so you can explore. It replaces your current data.',
              loadSampleData,
            )
          }>
          <View style={[styles.iconTile, { backgroundColor: colors.blueBgSoft }]}>
            <DownloadSimple size={20} color={colors.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Load sample data</Text>
            <Text style={styles.rowSubtitle}>Explore the app with example numbers</Text>
          </View>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={styles.row}
          disabled={!hasData}
          onPress={() =>
            confirmAction(
              'Erase all data?',
              'Every transaction, bill, and debt on this device will be deleted. This can’t be undone.',
              eraseAllData,
            )
          }>
          <View style={[styles.iconTile, { backgroundColor: colors.redBgSoft }]}>
            <Trash size={20} color={colors.redDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, !hasData && { color: colors.textMuted }]}>
              Erase all data
            </Text>
            <Text style={styles.rowSubtitle}>
              {hasData ? 'Start over with a clean pocket' : 'Nothing to erase yet'}
            </Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconTile, { backgroundColor: colors.greenIconTileBg }]}>
            <Info size={20} color={colors.greenIconTileFg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Pocket</Text>
            <Text style={styles.rowSubtitle}>Version 1.0.0 · your data never leaves this device</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.screenTitle, color: colors.textPrimary },

  sectionLabel: {
    ...type.smallLabel,
    color: colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { ...type.rowTitle, color: colors.textPrimary },
  rowSubtitle: { ...type.rowSubtitle, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.divider },

  themeRow: { flexDirection: 'row', gap: 8, paddingTop: 14 },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderChip,
    backgroundColor: colors.background,
  },
  themeChipActive: { borderColor: colors.green, backgroundColor: colors.greenBgSoft },
  themeChipText: { fontFamily: fonts.extraBold, fontSize: 12.5, color: colors.textBody },
  themeChipTextActive: { color: colors.greenDark },
  themeHint: {
    ...type.rowSubtitle,
    color: colors.textMuted,
    paddingVertical: 12,
    textAlign: 'center',
  },
}));
