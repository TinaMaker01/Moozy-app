import { NativeModules, Platform } from 'react-native';
import { EqualizerSettings } from '../types/music';

interface MoozyEqualizerNativeModule {
  isSupported(): Promise<boolean>;
  setEnabled(enabled: boolean): Promise<boolean>;
  setBands(bands: { hz: number; gainDb: number }[]): Promise<boolean>;
  setBassBoostStrength(percent: number): Promise<boolean>;
  setVirtualizerStrength(percent: number): Promise<boolean>;
  release(): Promise<boolean>;
}

// Android only — see EqualizerModule.kt. On iOS (or if the native module is
// ever unavailable) every call below silently no-ops rather than throwing,
// so the Settings UI can stay identical and just stop having any audible
// effect instead of crashing.
const NativeEqualizer =
  Platform.OS === 'android'
    ? (NativeModules.MoozyEqualizer as MoozyEqualizerNativeModule | undefined)
    : undefined;

const BAND_FREQUENCIES_HZ: Record<keyof EqualizerSettings['bands'], number> = {
  hz60: 60,
  hz230: 230,
  hz910: 910,
  hz3600: 3600,
  hz14000: 14000,
};

/** Whether this device actually accepted the native audio effects — some OEMs restrict them. */
export async function isEqualizerSupported(): Promise<boolean> {
  if (!NativeEqualizer) {
    return false;
  }
  try {
    return await NativeEqualizer.isSupported();
  } catch (e) {
    return false;
  }
}

/**
 * Pushes the given settings to the device's real audio effects (5-band EQ,
 * bass boost, stereo widening) — see EqualizerModule.kt for why these apply
 * to the device's output mix rather than a session scoped to Moozy alone.
 * Fails silently (unsupported platform/device) rather than surfacing an
 * error the Equalizer screen has no meaningful way to act on.
 */
export async function applyEqualizerSettings(settings: EqualizerSettings): Promise<void> {
  if (!NativeEqualizer) {
    return;
  }
  try {
    await NativeEqualizer.setEnabled(true);
    const bands = (Object.keys(settings.bands) as (keyof EqualizerSettings['bands'])[]).map(
      (key) => ({
        hz: BAND_FREQUENCIES_HZ[key],
        gainDb: settings.bands[key],
      })
    );
    await NativeEqualizer.setBands(bands);
    await NativeEqualizer.setBassBoostStrength(settings.bassBoost);
    await NativeEqualizer.setVirtualizerStrength(settings.virtualizer);
  } catch (e) {
    console.warn('Failed to apply equalizer settings natively:', e);
  }
}
