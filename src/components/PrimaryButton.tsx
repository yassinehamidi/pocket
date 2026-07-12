import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

interface Props {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

/** The green gradient CTA used across the app (save, sign up, get started…). */
export function PrimaryButton({ label, onPress, icon, loading, disabled }: Props) {
  const colors = useColors();
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}>
      <LinearGradient
        colors={['#22a860', '#158a4c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, (disabled || loading) && { opacity: 0.6 }]}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            {icon}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  btn: {
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
  label: { ...type.sectionTitle, color: colors.white },
}));
