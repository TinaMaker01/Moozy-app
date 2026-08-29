import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../../src/store/useSettingsStore';

const initialState = useSettingsStore.getInitialState();

beforeEach(async () => {
  useSettingsStore.setState(initialState, true);
  await AsyncStorage.clear();
});

describe('useSettingsStore — appearance & playback toggles', () => {
  it('setThemeMode updates state and persists', async () => {
    await useSettingsStore.getState().setThemeMode('light');

    expect(useSettingsStore.getState().themeMode).toBe('light');
    expect(await AsyncStorage.getItem('@moozy_theme_mode_v1')).toBe('light');
  });

  it('toggleResumeOnStartup flips the flag and persists it', async () => {
    expect(useSettingsStore.getState().resumeOnStartup).toBe(true);

    await useSettingsStore.getState().toggleResumeOnStartup();

    expect(useSettingsStore.getState().resumeOnStartup).toBe(false);
    expect(JSON.parse((await AsyncStorage.getItem('@moozy_resume_on_startup_v1')) || 'null')).toBe(
      false
    );
  });

  it('toggleHideShortTracks flips the flag', async () => {
    await useSettingsStore.getState().toggleHideShortTracks();
    expect(useSettingsStore.getState().hideShortTracks).toBe(true);
    await useSettingsStore.getState().toggleHideShortTracks();
    expect(useSettingsStore.getState().hideShortTracks).toBe(false);
  });
});

describe('useSettingsStore — folder exclusion', () => {
  it('toggleExcludedFolder adds then removes a folder', async () => {
    await useSettingsStore.getState().toggleExcludedFolder('/music/podcasts');
    expect(useSettingsStore.getState().excludedFolders).toEqual(['/music/podcasts']);

    await useSettingsStore.getState().toggleExcludedFolder('/music/podcasts');
    expect(useSettingsStore.getState().excludedFolders).toEqual([]);
  });

  it('does not add the same folder twice', async () => {
    await useSettingsStore.getState().toggleExcludedFolder('/music/a');
    await useSettingsStore.getState().toggleExcludedFolder('/music/b');

    expect(useSettingsStore.getState().excludedFolders.sort()).toEqual(['/music/a', '/music/b']);
  });
});

describe('useSettingsStore — equalizer', () => {
  it('setEqualizerPreset applies the matching band values', () => {
    useSettingsStore.getState().setEqualizerPreset('Bass Boost');

    const { equalizer } = useSettingsStore.getState();
    expect(equalizer.preset).toBe('Bass Boost');
    expect(equalizer.bands.hz60).toBeGreaterThan(0);
  });

  it('setBandGain only changes the targeted band', () => {
    useSettingsStore.getState().setEqualizerPreset('Flat');
    useSettingsStore.getState().setBandGain('hz910', 7);

    const { bands } = useSettingsStore.getState().equalizer;
    expect(bands.hz910).toBe(7);
    expect(bands.hz60).toBe(0);
  });
});

describe('useSettingsStore — reset & init', () => {
  it('resetSettings restores every setting to its default', async () => {
    await useSettingsStore.getState().setThemeMode('light');
    await useSettingsStore.getState().toggleResumeOnStartup();
    await useSettingsStore.getState().toggleExcludedFolder('/music/a');
    useSettingsStore.getState().setEqualizerPreset('Rock');

    await useSettingsStore.getState().resetSettings();

    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe('dark');
    expect(state.resumeOnStartup).toBe(true);
    expect(state.excludedFolders).toEqual([]);
    expect(state.equalizer.preset).toBe('Flat');
  });

  it('initSettings restores a persisted theme mode', async () => {
    await AsyncStorage.setItem('@moozy_theme_mode_v1', 'system');

    await useSettingsStore.getState().initSettings();

    expect(useSettingsStore.getState().themeMode).toBe('system');
  });

  it('initSettings ignores an invalid persisted theme mode instead of applying it', async () => {
    await AsyncStorage.setItem('@moozy_theme_mode_v1', 'not-a-real-mode');

    await useSettingsStore.getState().initSettings();

    expect(useSettingsStore.getState().themeMode).toBe('dark');
  });
});
