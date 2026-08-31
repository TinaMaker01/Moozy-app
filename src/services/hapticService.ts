import { Platform, Vibration } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Triggers a short tactile feedback pulse if haptic feedback is enabled in settings.
 * Uses React Native's built-in Vibration API (no extra native dependencies needed).
 */
export function triggerHapticFeedback(durationMs = 15): void {
  try {
    const isEnabled = useSettingsStore.getState().hapticFeedbackEnabled;
    if (!isEnabled) {
      return;
    }

    if (Platform.OS === 'android') {
      Vibration.vibrate(durationMs);
    } else {
      Vibration.vibrate();
    }
  } catch (e) {
    // Fail silently if vibration is not supported or restricted on the device
  }
}
