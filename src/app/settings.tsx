import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import {
  CaretLeft,
  DownloadSimple,
  EyeSlash,
  Info,
  Trash,
} from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { confirmAction } from '@/lib/confirm';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const privacyMode = useFinanceStore((s) => s.settings.privacyMode);
  const setPrivacyMode = useFinanceStore((s) => s.setPrivacyMode);
  const loadSampleData = useFinanceStore((s) => s.loadSampleData);
  const eraseAllData = useFinanceStore((s) => s.eraseAllData);
  const hasData = useFinanceStore(
    (s) => s.transactions.length > 0 || s.bills.length > 0 || s.debts.length > 0,
  );

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
