import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EqualizerPreset, EqualizerSettings } from '../types/music';
import { AudioService } from '../services/audioService';
import { THEME_MODE_STORAGE_KEY } from '../constants/storageKeys';

export type ThemeMode = 'light' | 'dark' | 'system';

const PRESET_CONFIGS: Record<EqualizerPreset, EqualizerSettings['bands']> = {
  Flat: { hz60: 0, hz230: 0, hz910: 0, hz3600: 0, hz14000: 0 },
  'Bass Boost': { hz60: 8, hz230: 5, hz910: 1, hz3600: 0, hz14000: -1 },
  'Vocal Boost': { hz60: -2, hz230: 0, hz910: 5, hz3600: 6, hz14000: 2 },
  Electronic: { hz60: 6, hz230: 4, hz910: 0, hz3600: 3, hz14000: 6 },
  Rock: { hz60: 5, hz230: 2, hz910: 4, hz3600: 3, hz14000: 5 },
  Pop: { hz60: 3, hz230: 2, hz910: 5, hz3600: 4, hz14000: 2 },
  Acoustic: { hz60: 2, hz230: 4, hz910: 3, hz3600: 4, hz14000: 3 },
  Jazz: { hz60: 4, hz230: 3, hz910: 2, hz3600: 3, hz14000: 1 },
};

interface SettingsStoreState {
  equalizer: EqualizerSettings;
  sleepTimerRemainingSeconds: number | null;
  sleepTimerIntervalId: any;
  hapticFeedbackEnabled: boolean;
  highQualityAudio: boolean;
  /** Light/Dark/System — 'system' follows the OS appearance setting. Persisted across restarts. */
  themeMode: ThemeMode;

  // Actions
  initSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setBandGain: (band: keyof EqualizerSettings['bands'], gain: number) => void;
  setBassBoost: (val: number) => void;
  setVirtualizer: (val: number) => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  toggleHapticFeedback: () => void;
  toggleHighQualityAudio: () => void;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  equalizer: {
    preset: 'Flat',
    bassBoost: 20,
    virtualizer: 15,
    bands: { ...PRESET_CONFIGS.Flat },
  },
  sleepTimerRemainingSeconds: null,
  sleepTimerIntervalId: null,
  hapticFeedbackEnabled: true,
  highQualityAudio: true,
  // Default stays dark — that's how the app has always looked; Light/System
  // are opt-in via the new Appearance setting, not a silent behavior change.
  themeMode: 'dark',

  initSettings: async () => {
    try {
      const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
        set({ themeMode: storedMode });
      }
    } catch (e) {
      console.warn('Failed to load persisted theme mode:', e);
    }
  },

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  },

  setEqualizerPreset: (preset) => {
    set((state) => ({
      equalizer: {
        ...state.equalizer,
        preset,
        bands: { ...PRESET_CONFIGS[preset] },
      },
    }));
  },

  setBandGain: (band, gain) => {
    set((state) => ({
      equalizer: {
        ...state.equalizer,
        bands: {
          ...state.equalizer.bands,
          [band]: gain,
        },
      },
    }));
  },

  setBassBoost: (val) => {
    set((state) => ({
      equalizer: { ...state.equalizer, bassBoost: val },
    }));
  },

  setVirtualizer: (val) => {
    set((state) => ({
      equalizer: { ...state.equalizer, virtualizer: val },
    }));
  },

  startSleepTimer: (minutes) => {
    // Clear any previous interval
    const existing = get().sleepTimerIntervalId;
    if (existing) {
      clearInterval(existing);
    }

    let remaining = minutes * 60;
    set({ sleepTimerRemainingSeconds: remaining });

    const intervalId = setInterval(async () => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(intervalId);
        set({ sleepTimerRemainingSeconds: null, sleepTimerIntervalId: null });
        await AudioService.pause();
      } else {
        set({ sleepTimerRemainingSeconds: remaining });
      }
    }, 1000);

    set({ sleepTimerIntervalId: intervalId });
  },

  cancelSleepTimer: () => {
    const existing = get().sleepTimerIntervalId;
    if (existing) {
      clearInterval(existing);
    }
    set({ sleepTimerRemainingSeconds: null, sleepTimerIntervalId: null });
  },

  toggleHapticFeedback: () => {
    set((state) => ({ hapticFeedbackEnabled: !state.hapticFeedbackEnabled }));
  },

  toggleHighQualityAudio: () => {
    set((state) => ({ highQualityAudio: !state.highQualityAudio }));
  },
}));
