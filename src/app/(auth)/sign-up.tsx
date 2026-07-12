import { Link } from 'expo-router';
import { Coins, EnvelopeSimple, LockSimple, User } from 'phosphor-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { PocketPop } from '@/components/PocketPop';
import { PrimaryButton } from '@/components/PrimaryButton';
import { isValidEmail } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const signUp = useAuthStore((s) => s.signUp);
  const setStartBalance = useFinanceStore((s) => s.setStartBalance);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [startBalance, setStartBalanceInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Tell us what to call you';
    if (!isValidEmail(email)) next.email = 'That doesn’t look like an email';
    if (password.length < 6) next.password = 'At least 6 characters';
    if (confirm !== password) next.confirm = 'Passwords don’t match';
    if (startBalance && isNaN(parseFloat(startBalance)))
      next.startBalance = 'Numbers only';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await signUp({ name, email, password });
      const start = parseFloat(startBalance);
      if (!isNaN(start) && start > 0) setStartBalance(start);
      // Route guards switch to the app stack automatically.
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <View style={styles.logoTile}>
            <Coins size={26} color={colors.greenDark} weight="fill" />
          </View>
          <Text style={styles.logoText}>Pocket</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Everything stays on this device — no cloud, no sharing.
        </Text>

        <View style={styles.form}>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="How should we greet you?"
            autoCapitalize="words"
            icon={<User size={18} color={colors.textMuted} />}
            error={errors.name}
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<EnvelopeSimple size={18} color={colors.textMuted} />}
            error={errors.email}
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={errors.password}
          />
          <FormField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Same one again"
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={errors.confirm}
          />
          <FormField
            label="Current balance in DH (optional)"
            value={startBalance}
            onChangeText={setStartBalanceInput}
            placeholder="What’s in your pocket right now?"
            keyboardType="numeric"
            icon={<Coins size={18} color={colors.textMuted} />}
            error={errors.startBalance}
          />
        </View>

        <PrimaryButton label="Sign up" onPress={submit} loading={busy} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account?</Text>
          <Link href="/log-in" style={styles.switchLink}>
            Log in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </PocketPop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.greenBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { ...type.screenTitle, color: colors.textPrimary },
  title: { fontFamily: fonts.black, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textBody, marginTop: 6 },
  form: { gap: 14, marginTop: 24, marginBottom: 24 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 18 },
  switchText: { ...type.cardLabel, color: colors.textBody },
  switchLink: { ...type.cardLabel, color: colors.green },
});
