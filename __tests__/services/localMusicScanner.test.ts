import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import {
  requestStoragePermission,
  scanLocalMusicFiles,
} from '../../src/services/localMusicScanner';
import * as nativeScanner from '../../src/services/nativeLibraryScanner';

jest.mock('react-native-fs', () => ({
  ExternalStorageDirectoryPath: '/storage/emulated/0',
  DocumentDirectoryPath: '/data/user/0/com.moozy/files',
  MainBundlePath: '/bundle',
  exists: jest.fn(),
  readDir: jest.fn(),
}));

describe('localMusicScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestStoragePermission', () => {
    it('returns true directly for iOS', async () => {
      Platform.OS = 'ios';
      const requestSpy = jest.spyOn(PermissionsAndroid, 'request');

      const result = await requestStoragePermission();

      expect(result).toBe(true);
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('requests READ_MEDIA_AUDIO on Android API 33+', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 34;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

      const result = await requestStoragePermission();

      expect(result).toBe(true);
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        'android.permission.READ_MEDIA_AUDIO',
        expect.any(Object)
      );
    });

    it('requests READ_EXTERNAL_STORAGE on Android API < 33', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 30;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

      const result = await requestStoragePermission();

      expect(result).toBe(true);
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        expect.any(Object)
      );
    });

    it('returns false when storage permission is denied', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 33;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

      const result = await requestStoragePermission();

      expect(result).toBe(false);
    });
  });

  describe('scanLocalMusicFiles', () => {
    it('returns empty array when permission is denied', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 33;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

      const tracks = await scanLocalMusicFiles();

      expect(tracks).toEqual([]);
    });

    it('uses native MediaStore scanner when available on Android', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 33;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

      jest.spyOn(nativeScanner, 'hasNativeLibraryScanner').mockReturnValue(true);
      const mockTracks = [
        {
          id: 'local-1',
          url: 'file:///storage/emulated/0/Music/Song.mp3',
          title: 'Song',
          artist: 'Artist',
          isLocal: true,
        },
      ];
      jest.spyOn(nativeScanner, 'scanAudioFilesNative').mockResolvedValueOnce(mockTracks as any);

      const tracks = await scanLocalMusicFiles();

      expect(tracks).toEqual(mockTracks);
    });

    it('falls back to filesystem walk when native scanner returns empty or fails', async () => {
      Platform.OS = 'android';
      (Platform.constants as any).Version = 33;
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

      jest.spyOn(nativeScanner, 'hasNativeLibraryScanner').mockReturnValue(true);
      jest.spyOn(nativeScanner, 'scanAudioFilesNative').mockRejectedValueOnce(new Error('MediaStore fail'));

      (RNFS.exists as jest.Mock).mockImplementation((path) =>
        Promise.resolve(path === '/storage/emulated/0/Music')
      );

      (RNFS.readDir as jest.Mock).mockImplementation((path) => {
        if (path === '/storage/emulated/0/Music') {
          return Promise.resolve([
            {
              name: 'Queen - Bohemian Rhapsody.mp3',
              path: '/storage/emulated/0/Music/Queen - Bohemian Rhapsody.mp3',
              isFile: () => true,
              isDirectory: () => false,
              size: 5000000,
            },
            {
              name: 'short_clip.mp3',
              path: '/storage/emulated/0/Music/short_clip.mp3',
              isFile: () => true,
              isDirectory: () => false,
              size: 50000, // < 200KB, should be ignored
            },
            {
              name: 'image.jpg',
              path: '/storage/emulated/0/Music/image.jpg',
              isFile: () => true,
              isDirectory: () => false,
              size: 1000000,
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const tracks = await scanLocalMusicFiles();

      expect(tracks).toHaveLength(1);
      expect(tracks[0].title).toBe('Bohemian Rhapsody');
      expect(tracks[0].artist).toBe('Queen');
      expect(tracks[0].url).toBe('file:///storage/emulated/0/Music/Queen - Bohemian Rhapsody.mp3');
      expect(tracks[0].isLocal).toBe(true);
    });
  });
});
