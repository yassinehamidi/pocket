import { Link } from 'expo-router';
import { Coins, EnvelopeSimple, LockSimple } from 'phosphor-react-native';
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
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';

export default function LogInScreen() {
  const insets = useSafeAreaInsets();
  const logIn = useAuthStore((s) => s.logIn);
  const account = useAuthStore((s) => s.account);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const ok = await logIn({ email, password });
      if (!ok) setError('Wrong email or password.');
      // On success the route guards switch to the app stack.
    } finally {
      setBusy(false);
    }
  };

  return (
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

        <Text style={styles.title}>
          {account ? `Welcome back${account.name ? `, ${account.name}` : ''}` : 'Welcome back'}
        </Text>
        <Text style={styles.subtitle}>Log in to open your pocket.</Text>

        <View style={styles.form}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<EnvelopeSimple size={18} color={colors.textMuted} />}
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            autoCapitalize="none"
            secureTextEntry
            icon={<LockSimple size={18} color={colors.textMuted} />}
            error={error}
          />
        </View>

        <PrimaryButton label="Log in" onPress={submit} loading={busy} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>New here?</Text>
          <Link href="/sign-up" style={styles.switchLink}>
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
