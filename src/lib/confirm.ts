import { Alert, Platform } from 'react-native';

/**
 * Cross-platform destructive-action confirm: native Alert on iOS/Android,
 * window.confirm on web (Alert buttons don't render in react-native-web).
 */
export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm },
  ]);
}
