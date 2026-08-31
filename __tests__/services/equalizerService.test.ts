import { NativeModules, Platform } from 'react-native';
import { applyEqualizerSettings, isEqualizerSupported } from '../../src/services/equalizerService';
import { EqualizerSettings } from '../../src/types/music';

describe('equalizerService', () => {
  const mockMoozyEqualizer = {
    isSupported: jest.fn(),
    setEnabled: jest.fn(),
    setBands: jest.fn(),
    setBassBoostStrength: jest.fn(),
    setVirtualizerStrength: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    NativeModules.MoozyEqualizer = mockMoozyEqualizer;
  });

  it('isEqualizerSupported returns false on non-Android platform', async () => {
    Platform.OS = 'ios';
    const result = await isEqualizerSupported();
    expect(result).toBe(false);
  });

  it('isEqualizerSupported calls native isSupported on Android', async () => {
    mockMoozyEqualizer.isSupported.mockResolvedValueOnce(true);
    const result = await isEqualizerSupported();
    expect(result).toBe(true);
    expect(mockMoozyEqualizer.isSupported).toHaveBeenCalledTimes(1);
  });

  it('isEqualizerSupported returns false if native call rejects', async () => {
    mockMoozyEqualizer.isSupported.mockRejectedValueOnce(new Error('Device not supported'));
    const result = await isEqualizerSupported();
    expect(result).toBe(false);
  });

  it('applyEqualizerSettings applies bands, bass boost, and virtualizer', async () => {
    mockMoozyEqualizer.setEnabled.mockResolvedValueOnce(true);
    mockMoozyEqualizer.setBands.mockResolvedValueOnce(true);
    mockMoozyEqualizer.setBassBoostStrength.mockResolvedValueOnce(true);
    mockMoozyEqualizer.setVirtualizerStrength.mockResolvedValueOnce(true);

    const testSettings: EqualizerSettings = {
      preset: 'Rock',
      bassBoost: 35,
      virtualizer: 20,
      bands: {
        hz60: 5,
        hz230: 2,
        hz910: 4,
        hz3600: 3,
        hz14000: 5,
      },
    };

    await applyEqualizerSettings(testSettings);

    expect(mockMoozyEqualizer.setEnabled).toHaveBeenCalledWith(true);
    expect(mockMoozyEqualizer.setBands).toHaveBeenCalledWith([
      { hz: 60, gainDb: 5 },
      { hz: 230, gainDb: 2 },
      { hz: 910, gainDb: 4 },
      { hz: 3600, gainDb: 3 },
      { hz: 14000, gainDb: 5 },
    ]);
    expect(mockMoozyEqualizer.setBassBoostStrength).toHaveBeenCalledWith(35);
    expect(mockMoozyEqualizer.setVirtualizerStrength).toHaveBeenCalledWith(20);
  });

  it('applyEqualizerSettings handles errors silently without throwing', async () => {
    mockMoozyEqualizer.setEnabled.mockRejectedValueOnce(new Error('AudioFX failure'));

    const testSettings: EqualizerSettings = {
      preset: 'Flat',
      bassBoost: 0,
      virtualizer: 0,
      bands: { hz60: 0, hz230: 0, hz910: 0, hz3600: 0, hz14000: 0 },
    };

    await expect(applyEqualizerSettings(testSettings)).resolves.not.toThrow();
  });
});
