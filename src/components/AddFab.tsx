import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/theme/useTheme';

const SPRING = { damping: 15, stiffness: 250 };

/**
 * Floating "+" action for iOS, shown above the native tab bar — the iOS 26
 * pattern for a primary action is a detached circular glass button (like the
 * system's separated Search circle), since native tab bars have no FAB slot.
 * Real Liquid Glass when available, brand gradient circle otherwise.
 */
export function AddFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glass = isLiquidGlassAvailable();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + 74 }]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.88, SPRING))}
        onPressOut={() => (scale.value = withSpring(1, SPRING))}
        onPress={() => router.push('/add')}>
        <Animated.View style={animStyle}>
          {glass ? (
            <GlassView isInteractive style={styles.fab}>
              <Plus size={26} color={colors.green} weight="bold" />
            </GlassView>
          ) : (
            <LinearGradient
              colors={['#22a860', '#158a4c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}>
              <Plus size={26} color="#ffffff" weight="bold" />
            </LinearGradient>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 18 },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
