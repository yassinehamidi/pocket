import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import {
  CaretLeft,
  Coins,
  LockSimple,
  SignOut,
  Trash,
  User,
} from 'phosphor-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { PocketPop } from '@/components/PocketPop';
import { PrimaryButton } from '@/components/PrimaryButton';
import { confirmAction } from '@/lib/confirm';
import { fmtDH } from '@/lib/format';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const account = useAuthStore((s) => s.account);
  const updateName = useAuthStore((s) => s.updateName);
  const changePassword = useAuthStore((s) => s.changePassword);
  const logOut = useAuthStore((s) => s.logOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const startBalance = useFinanceStore((s) => s.settings.startBalance);
  const setStartBalance = useFinanceStore((s) => s.setStartBalance);

  const [name, setName] = useState(account?.name ?? '');
  const [balanceInput, setBalanceInput] = useState(
    startBalance > 0 ? String(startBalance) : '',
  );
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  if (!account) return null;

  const flash = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2500);
  };

  const saveProfile = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Your name can’t be empty';
    const balance = balanceInput.trim() === '' ? 0 : parseFloat(balanceInput);
    if (isNaN(balance) || balance < 0) next.balance = 'Numbers only';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateName(name);
    setStartBalance(balance);
    flash('Profile saved');
  };

  const savePassword = async () => {
    const next: Record<string, string> = {};
    if (newPw.length < 6) next.newPw = 'At least 6 characters';
    if (confirmPw !== newPw) next.confirmPw = 'Passwords don’t match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const ok = await changePassword(currentPw, newPw);
      if (!ok) {
        setErrors({ currentPw: 'Current password is wrong' });
        return;
      }
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      flash('Password changed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PocketPop>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => dismissScreen(router)}>
            <CaretLeft size={18} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>Account</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>
              {(account.name[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{account.name}</Text>
          <Text style={styles.profileEmail}>{account.email}</Text>
        </View>

        {!!saved && (
          <View style={styles.savedPill}>
            <Text style={styles.savedText}>{saved}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.form}>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            icon={<User size={18} color={colors.textMuted} />}
            error={errors.name}
          />
          <FormField
            label={`Starting balance (currently ${fmtDH(startBalance)})`}
            value={balanceInput}
            onChangeText={setBalanceInput}
            placeholder="0"
            keyboardType="numeric"
            icon={<Coins size={18} color={colors.textMuted} />}
            error={errors.balance}
          />
          <PrimaryButton label="Save profile" onPress={saveProfile} />
        </View>

        <Text style={styles.sectionLabel}>Change password</Text>
        <View style={styles.form}>
          <FormField
            label="Current password"
            value={currentPw}
            onChangeText={setCurrentPw}
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={errors.currentPw}
          />
          <FormField
            label="New password"
            value={newPw}
            onChangeText={setNewPw}
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={errors.newPw}
          />
          <FormField
            label="Confirm new password"
            value={confirmPw}
            onChangeText={setConfirmPw}
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={errors.confirmPw}
          />
          <PrimaryButton label="Change password" onPress={savePassword} loading={busy} />
        </View>

        <Text style={styles.sectionLabel}>Session</Text>
        <View style={styles.dangerCard}>
          <Pressable style={styles.dangerRow} onPress={logOut}>
            <View style={[styles.iconTile, { backgroundColor: colors.greenBgSoft }]}>
              <SignOut size={20} color={colors.greenDark} />
            </View>
            <Text style={styles.dangerRowTitle}>Log out</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.dangerRow}
            onPress={() =>
              confirmAction(
                'Delete account?',
                'Your account and every transaction, bill, and debt on this device will be permanently deleted.',
                deleteAccount,
              )
            }>
            <View style={[styles.iconTile, { backgroundColor: colors.redBgSoft }]}>
              <Trash size={20} color={colors.redDark} />
            </View>
            <Text style={[styles.dangerRowTitle, { color: colors.redDark }]}>
              Delete account & data
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </PocketPop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
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

  profileCard: { alignItems: 'center', marginBottom: 18 },
  bigAvatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: { fontFamily: fonts.black, fontSize: 34, color: colors.greenDark },
  profileName: { ...type.greeting, color: colors.textPrimary, marginTop: 10 },
  profileEmail: { ...type.cardLabel, color: colors.textMuted },

  savedPill: {
    alignSelf: 'center',
    backgroundColor: colors.greenBgSoft,
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  savedText: { ...type.smallLabel, color: colors.greenDark },

  sectionLabel: {
    ...type.smallLabel,
    color: colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  form: { gap: 14 },

  dangerCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerRowTitle: { ...type.rowTitle, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.divider },
});
