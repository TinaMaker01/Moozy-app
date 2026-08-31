import { NativeModules } from 'react-native';
import {
  hasNativeLibraryScanner,
  scanAudioFilesNative,
} from '../../src/services/nativeLibraryScanner';

describe('nativeLibraryScanner', () => {
  const mockScanAudioFiles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    NativeModules.MediaScanner = {
      scanAudioFiles: mockScanAudioFiles,
    };
  });

  it('hasNativeLibraryScanner returns true when native module is present', () => {
    expect(hasNativeLibraryScanner()).toBe(true);
  });

  it('hasNativeLibraryScanner returns false when native module is missing', () => {
    delete NativeModules.MediaScanner;
    expect(hasNativeLibraryScanner()).toBe(false);
  });

  it('scanAudioFilesNative maps native MediaStore rows to Track format correctly', async () => {
    const mockNativeTracks = [
      {
        id: '123',
        title: 'Song Title',
        artist: 'Artist Name',
        album: 'Album Name',
        albumId: '456',
        duration: 215,
        path: '/storage/emulated/0/Music/Album/Song.mp3',
        dateAdded: 1700000000,
        size: 5000000,
        artworkUri: 'content://media/external/audio/albumart/456',
      },
      {
        id: '124',
        title: '',
        artist: '<unknown>',
        album: '<unknown>',
        albumId: '',
        duration: 0,
        path: '/storage/emulated/0/Download/Untitled.wav',
        dateAdded: 0,
        size: 1000000,
        artworkUri: '',
      },
    ];

    mockScanAudioFiles.mockResolvedValueOnce(mockNativeTracks);

    const tracks = await scanAudioFilesNative();

    expect(tracks).toHaveLength(2);

    expect(tracks[0]).toEqual({
      id: 'local-123',
      url: 'file:///storage/emulated/0/Music/Album/Song.mp3',
      title: 'Song Title',
      artist: 'Artist Name',
      album: 'Album Name',
      albumId: '456',
      duration: 215,
      artwork: 'content://media/external/audio/albumart/456',
      isLocal: true,
      isFavorite: false,
      addedAt: 1700000000000,
      folderPath: '/storage/emulated/0/Music/Album',
    });

    expect(tracks[1].id).toBe('local-124');
    expect(tracks[1].title).toBe('Untitled.wav');
    expect(tracks[1].artist).toBe('Artiste Inconnu');
    expect(tracks[1].album).toBeUndefined();
    expect(tracks[1].duration).toBeUndefined();
    expect(tracks[1].folderPath).toBe('/storage/emulated/0/Download');
    expect(typeof tracks[1].addedAt).toBe('number');
  });

  it('scanAudioFilesNative returns empty array when scanner is not available', async () => {
    delete NativeModules.MediaScanner;
    const tracks = await scanAudioFilesNative();
    expect(tracks).toEqual([]);
  });
});
