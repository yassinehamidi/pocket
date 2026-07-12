import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen entrance animation from the design reference's `pocketpop`
 * keyframes: fade in while rising 8px over 320ms. Replays every time
 * the screen gains focus (tab switches, pushed screens, modals).
 */
export function PocketPop({ children, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

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
    <Animated.View
      style={[
        { flex: 1 },
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
