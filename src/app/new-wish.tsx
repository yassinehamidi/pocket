import { useRouter } from 'expo-router';
import { dismissScreen } from '@/lib/navigation';
import { Coins, Sparkle, X } from 'phosphor-react-native';
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
import { currencySymbol } from '@/lib/format';
import { useFinanceStore } from '@/store/useFinanceStore';
import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

export default function NewWishScreen() {
  const colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addWish = useFinanceStore((s) => s.addWish);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const next: Record<string, string> = {};
    const value = parseFloat(price);
    if (!name.trim()) next.name = 'What are you dreaming of?';
    if (isNaN(value) || value <= 0) next.price = 'Enter a price above 0';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    addWish({ name: name.trim(), price: value });
    dismissScreen(router);
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
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>New wish</Text>
          <Pressable style={styles.closeBtn} onPress={() => dismissScreen(router)}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Pocket checks your balance, unpaid bills, debt, savings goal, and the days left
          until your salary — then tells you if you can buy it guilt-free.
        </Text>

        <View style={styles.form}>
          <FormField
            label="What do you wish for?"
            value={name}
            onChangeText={setName}
            placeholder="New phone, concert tickets…"
            icon={<Sparkle size={18} color={colors.textMuted} />}
            error={errors.name}
          />
          <FormField
            label={`Price (${currencySymbol()})`}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="numeric"
            icon={<Coins size={18} color={colors.textMuted} />}
            error={errors.price}
          />
        </View>

        <PrimaryButton label="Add to wishlist" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 10,
    marginHorizontal: 2,
  },
  title: { ...type.screenTitle, color: colors.textPrimary },
  subtitle: {
    ...type.rowSubtitle,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 18,
    marginHorizontal: 2,
  },
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
  form: { gap: 14, marginBottom: 24 },
}));
