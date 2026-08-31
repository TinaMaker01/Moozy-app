import { Platform, Vibration } from 'react-native';
import { triggerHapticFeedback } from '../../src/services/hapticService';
import { useSettingsStore } from '../../src/store/useSettingsStore';

describe('hapticService', () => {
  let vibrateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    vibrateSpy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  });

  afterEach(() => {
    vibrateSpy.mockRestore();
  });

  it('triggers vibration on Android when hapticFeedbackEnabled is true', () => {
    Platform.OS = 'android';
    useSettingsStore.setState({ hapticFeedbackEnabled: true });

    triggerHapticFeedback(20);

    expect(vibrateSpy).toHaveBeenCalledWith(20);
  });

  it('triggers default vibration on iOS when hapticFeedbackEnabled is true', () => {
    Platform.OS = 'ios';
    useSettingsStore.setState({ hapticFeedbackEnabled: true });

    triggerHapticFeedback(20);

    expect(vibrateSpy).toHaveBeenCalledWith();
  });

  it('does not vibrate when hapticFeedbackEnabled is false', () => {
    Platform.OS = 'android';
    useSettingsStore.setState({ hapticFeedbackEnabled: false });

    triggerHapticFeedback();

    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it('handles exceptions from Vibration gracefully without throwing', () => {
    Platform.OS = 'android';
    useSettingsStore.setState({ hapticFeedbackEnabled: true });
    vibrateSpy.mockImplementationOnce(() => {
      throw new Error('Vibrator unavailable');
    });

    expect(() => triggerHapticFeedback()).not.toThrow();
  });
});
