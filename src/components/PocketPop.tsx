import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, View, ViewStyle } from 'react-native';

import { useColors } from '@/theme/useTheme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen entrance animation from the design reference's `pocketpop`
 * keyframes: fade in while rising 8px over 320ms. Replays every time
 * the screen gains focus (tab switches, pushed screens, modals).
 *
 * The animation runs on an inner view above a static, theme-colored
 * backdrop — during the opacity-0 frames the backdrop shows instead of
 * whatever the native container behind the screen is (white), which
 * flashed on every tab switch in dark mode.
 */
export function PocketPop({ children, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const colors = useColors();

  useFocusEffect(
    useCallback(() => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, [anim]),
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <Animated.View
        style={{
          flex: 1,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        }}>
        {children}
      </Animated.View>
    </View>
  );
}
