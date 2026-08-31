import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EqualizerPreset, EqualizerSettings } from '../types/music';
import { AudioService } from '../services/audioService';
import { applyEqualizerSettings, isEqualizerSupported } from '../services/equalizerService';
import {
  ALBUMS_VIEW_MODE_STORAGE_KEY,
  DEFAULT_SORT_STORAGE_KEY,
  EQUALIZER_STORAGE_KEY,
  EXCLUDED_FOLDERS_STORAGE_KEY,
  HAPTIC_FEEDBACK_STORAGE_KEY,
  HIDE_SHORT_TRACKS_STORAGE_KEY,
  HIGH_QUALITY_AUDIO_STORAGE_KEY,
  LIST_DENSITY_STORAGE_KEY,
  REDUCE_MOTION_STORAGE_KEY,
  RESUME_ON_STARTUP_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
} from '../constants/storageKeys';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ListDensity = 'comfortable' | 'compact';
export type AlbumsViewMode = 'list' | 'grid';
export type DefaultSort = 'title' | 'artist' | 'recent';

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

const DEFAULT_EQUALIZER: EqualizerSettings = {
  preset: 'Flat',
  bassBoost: 20,
  virtualizer: 15,
  bands: { ...PRESET_CONFIGS.Flat },
};

/**
 * Writes the equalizer settings to disk and pushes them to the device's
 * real audio effects in one place, so every action that touches `equalizer`
 * below (preset, a single band, bass boost, virtualizer) stays in sync with
 * what's actually applied to playback instead of just updating UI state.
 */
function persistAndApplyEqualizer(equalizer: EqualizerSettings) {
  AsyncStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(equalizer)).catch(console.warn);
  applyEqualizerSettings(equalizer);
}

interface SettingsStoreState {
  equalizer: EqualizerSettings;
  /** Whether this device actually accepted the native audio effects — see equalizerService.ts. */
  equalizerSupported: boolean;
  sleepTimerRemainingSeconds: number | null;
  sleepTimerIntervalId: any;
  hapticFeedbackEnabled: boolean;
  highQualityAudio: boolean;
  /** Light/Dark/System — 'system' follows the OS appearance setting. Persisted across restarts. */
  themeMode: ThemeMode;
  /** Whether app start reloads the last session into the player (paused) or starts fresh. */
  resumeOnStartup: boolean;
  /** Hides scanned tracks under ~30s (voice memos, notification-style clips misfiled as music). */
  hideShortTracks: boolean;
  /** Folder paths a rescan should skip; tracks already in the library from a newly-excluded folder are removed immediately. */
  excludedFolders: string[];
  listDensity: ListDensity;
  /** Skips non-essential decorative animations (vinyl spin, visualizer bars) — motion sensitivity / battery. */
  reduceMotion: boolean;
  albumsViewMode: AlbumsViewMode;
  defaultSort: DefaultSort;

  // Actions
  initSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setBandGain: (band: keyof EqualizerSettings['bands'], gain: number) => void;
  setBassBoost: (val: number) => void;
  setVirtualizer: (val: number) => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  toggleHapticFeedback: () => Promise<void>;
  toggleHighQualityAudio: () => Promise<void>;
  toggleResumeOnStartup: () => Promise<void>;
  toggleHideShortTracks: () => Promise<void>;
  toggleExcludedFolder: (folder: string) => Promise<void>;
  setListDensity: (density: ListDensity) => Promise<void>;
  toggleReduceMotion: () => Promise<void>;
  setAlbumsViewMode: (mode: AlbumsViewMode) => Promise<void>;
  setDefaultSort: (sort: DefaultSort) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  equalizer: DEFAULT_EQUALIZER,
  // Optimistic default — true on the vast majority of Android devices — so
  // the Equalizer screen doesn't flash an "unsupported" warning for the
  // brief moment before initSettings' async native check resolves. Flipped
  // to false only once that check actually comes back negative.
  equalizerSupported: true,
  sleepTimerRemainingSeconds: null,
  sleepTimerIntervalId: null,
  hapticFeedbackEnabled: true,
  highQualityAudio: true,
  // Default stays dark — that's how the app has always looked; Light/System
  // are opt-in via the new Appearance setting, not a silent behavior change.
  themeMode: 'dark',
  resumeOnStartup: true,
  hideShortTracks: false,
  excludedFolders: [],
  listDensity: 'comfortable',
  reduceMotion: false,
  albumsViewMode: 'list',
  defaultSort: 'title',

  initSettings: async () => {
    // Independent of the persisted-settings load below: detect once whether
    // this device even accepts the native audio effects, so the Equalizer
    // screen can say so honestly instead of pretending sliders always work.
    isEqualizerSupported()
      .then((supported) => set({ equalizerSupported: supported }))
      .catch(() => {});

    try {
      const [
        storedMode,
        storedResume,
        storedHideShort,
        storedExcluded,
        storedDensity,
        storedReduceMotion,
        storedAlbumsView,
        storedDefaultSort,
        storedEqualizer,
        storedHaptic,
        storedHighQuality,
      ] = await Promise.all([
        AsyncStorage.getItem(THEME_MODE_STORAGE_KEY),
        AsyncStorage.getItem(RESUME_ON_STARTUP_STORAGE_KEY),
        AsyncStorage.getItem(HIDE_SHORT_TRACKS_STORAGE_KEY),
        AsyncStorage.getItem(EXCLUDED_FOLDERS_STORAGE_KEY),
        AsyncStorage.getItem(LIST_DENSITY_STORAGE_KEY),
        AsyncStorage.getItem(REDUCE_MOTION_STORAGE_KEY),
        AsyncStorage.getItem(ALBUMS_VIEW_MODE_STORAGE_KEY),
        AsyncStorage.getItem(DEFAULT_SORT_STORAGE_KEY),
        AsyncStorage.getItem(EQUALIZER_STORAGE_KEY),
        AsyncStorage.getItem(HAPTIC_FEEDBACK_STORAGE_KEY),
        AsyncStorage.getItem(HIGH_QUALITY_AUDIO_STORAGE_KEY),
      ]);

      if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
        set({ themeMode: storedMode });
      }
      if (storedResume !== null) {
        set({ resumeOnStartup: JSON.parse(storedResume) });
      }
      if (storedHideShort !== null) {
        set({ hideShortTracks: JSON.parse(storedHideShort) });
      }
      if (storedExcluded) {
        set({ excludedFolders: JSON.parse(storedExcluded) });
      }
      if (storedDensity === 'comfortable' || storedDensity === 'compact') {
        set({ listDensity: storedDensity });
      }
      if (storedReduceMotion !== null) {
        set({ reduceMotion: JSON.parse(storedReduceMotion) });
      }
      if (storedAlbumsView === 'list' || storedAlbumsView === 'grid') {
        set({ albumsViewMode: storedAlbumsView });
      }
      if (storedDefaultSort === 'title' || storedDefaultSort === 'artist' || storedDefaultSort === 'recent') {
        set({ defaultSort: storedDefaultSort });
      }
      if (storedHaptic !== null) {
        set({ hapticFeedbackEnabled: JSON.parse(storedHaptic) });
      }
      if (storedHighQuality !== null) {
        set({ highQualityAudio: JSON.parse(storedHighQuality) });
      }
      if (storedEqualizer) {
        // Merge over the default rather than trust the stored blob outright —
        // a future band or field added to EqualizerSettings would otherwise
        // be missing from an equalizer object saved by an older app version.
        const parsed = JSON.parse(storedEqualizer);
        set({
          equalizer: {
            ...DEFAULT_EQUALIZER,
            ...parsed,
            bands: { ...DEFAULT_EQUALIZER.bands, ...parsed.bands },
          },
        });
      }
    } catch (e) {
      console.warn('Failed to load persisted theme mode:', e);
    }

    // Push whatever equalizer settings we ended up with (restored or
    // default) to the real audio effects — a fresh app start otherwise
    // left the previous session's EQ silently un-applied until the user
    // next touched a slider.
    applyEqualizerSettings(get().equalizer);
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
    persistAndApplyEqualizer(get().equalizer);
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
    persistAndApplyEqualizer(get().equalizer);
  },

  setBassBoost: (val) => {
    set((state) => ({
      equalizer: { ...state.equalizer, bassBoost: val },
    }));
    persistAndApplyEqualizer(get().equalizer);
  },

  setVirtualizer: (val) => {
    set((state) => ({
      equalizer: { ...state.equalizer, virtualizer: val },
    }));
    persistAndApplyEqualizer(get().equalizer);
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

  toggleHapticFeedback: async () => {
    const next = !get().hapticFeedbackEnabled;
    set({ hapticFeedbackEnabled: next });
    await AsyncStorage.setItem(HAPTIC_FEEDBACK_STORAGE_KEY, JSON.stringify(next));
  },

  toggleHighQualityAudio: async () => {
    const next = !get().highQualityAudio;
    set({ highQualityAudio: next });
    await AsyncStorage.setItem(HIGH_QUALITY_AUDIO_STORAGE_KEY, JSON.stringify(next));
  },

  toggleResumeOnStartup: async () => {
    const next = !get().resumeOnStartup;
    set({ resumeOnStartup: next });
    await AsyncStorage.setItem(RESUME_ON_STARTUP_STORAGE_KEY, JSON.stringify(next));
  },

  toggleHideShortTracks: async () => {
    const next = !get().hideShortTracks;
    set({ hideShortTracks: next });
    await AsyncStorage.setItem(HIDE_SHORT_TRACKS_STORAGE_KEY, JSON.stringify(next));
  },

  toggleExcludedFolder: async (folder) => {
    const current = get().excludedFolders;
    const next = current.includes(folder)
      ? current.filter((f) => f !== folder)
      : [...current, folder];
    set({ excludedFolders: next });
    await AsyncStorage.setItem(EXCLUDED_FOLDERS_STORAGE_KEY, JSON.stringify(next));
  },

  setListDensity: async (density) => {
    set({ listDensity: density });
    await AsyncStorage.setItem(LIST_DENSITY_STORAGE_KEY, density);
  },

  toggleReduceMotion: async () => {
    const next = !get().reduceMotion;
    set({ reduceMotion: next });
    await AsyncStorage.setItem(REDUCE_MOTION_STORAGE_KEY, JSON.stringify(next));
  },

  setAlbumsViewMode: async (mode) => {
    set({ albumsViewMode: mode });
    await AsyncStorage.setItem(ALBUMS_VIEW_MODE_STORAGE_KEY, mode);
  },

  setDefaultSort: async (sort) => {
    set({ defaultSort: sort });
    await AsyncStorage.setItem(DEFAULT_SORT_STORAGE_KEY, sort);
  },

  resetSettings: async () => {
    set({
      equalizer: DEFAULT_EQUALIZER,
      hapticFeedbackEnabled: true,
      highQualityAudio: true,
      themeMode: 'dark',
      resumeOnStartup: true,
      hideShortTracks: false,
      excludedFolders: [],
      listDensity: 'comfortable',
      reduceMotion: false,
      albumsViewMode: 'list',
      defaultSort: 'title',
    });
    await AsyncStorage.multiSet([
      [THEME_MODE_STORAGE_KEY, 'dark'],
      [RESUME_ON_STARTUP_STORAGE_KEY, JSON.stringify(true)],
      [HIDE_SHORT_TRACKS_STORAGE_KEY, JSON.stringify(false)],
      [EXCLUDED_FOLDERS_STORAGE_KEY, JSON.stringify([])],
      [LIST_DENSITY_STORAGE_KEY, 'comfortable'],
      [REDUCE_MOTION_STORAGE_KEY, JSON.stringify(false)],
      [ALBUMS_VIEW_MODE_STORAGE_KEY, 'list'],
      [DEFAULT_SORT_STORAGE_KEY, 'title'],
      [EQUALIZER_STORAGE_KEY, JSON.stringify(DEFAULT_EQUALIZER)],
      [HAPTIC_FEEDBACK_STORAGE_KEY, JSON.stringify(true)],
      [HIGH_QUALITY_AUDIO_STORAGE_KEY, JSON.stringify(true)],
    ]);
    applyEqualizerSettings(DEFAULT_EQUALIZER);
  },
}));
