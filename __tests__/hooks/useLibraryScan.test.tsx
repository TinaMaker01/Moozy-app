import React from 'react';
import { act, create } from 'react-test-renderer';
import { useLibraryScan } from '../../src/hooks/useLibraryScan';
import { useMusicStore } from '../../src/store/useMusicStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import * as localScanner from '../../src/services/localMusicScanner';
import { Track } from '../../src/types/music';

jest.mock('../../src/services/localMusicScanner', () => ({
  requestStoragePermission: jest.fn(),
  scanLocalMusicFiles: jest.fn(),
}));

const mockTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Valid Track 1',
    artist: 'Artist 1',
    url: 'file:///music/t1.mp3',
    duration: 180,
    folderPath: '/music/pop',
    isLocal: true,
  },
  {
    id: 'track-2',
    title: 'Short Track',
    artist: 'Artist 2',
    url: 'file:///music/short.mp3',
    duration: 15, // < 30s
    folderPath: '/music/pop',
    isLocal: true,
  },
  {
    id: 'track-3',
    title: 'Excluded Folder Track',
    artist: 'Artist 3',
    url: 'file:///music/excluded/t3.mp3',
    duration: 200,
    folderPath: '/music/excluded',
    isLocal: true,
  },
];

function TestHarness({
  onRender,
}: {
  onRender: (hookResult: ReturnType<typeof useLibraryScan>) => void;
}) {
  const hookResult = useLibraryScan();
  onRender(hookResult);
  return null;
}

describe('useLibraryScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMusicStore.setState({ tracks: [] });
    useSettingsStore.setState({
      excludedFolders: [],
      hideShortTracks: false,
    });
  });

  it('scan adds newly discovered tracks to music store', async () => {
    (localScanner.scanLocalMusicFiles as jest.Mock).mockResolvedValueOnce([mockTracks[0]]);

    let hookResult: ReturnType<typeof useLibraryScan>;
    act(() => {
      create(<TestHarness onRender={(res) => (hookResult = res)} />);
    });

    let scanResult: any;
    await act(async () => {
      scanResult = await hookResult!.scan();
    });

    expect(scanResult.found).toHaveLength(1);
    expect(scanResult.added).toHaveLength(1);
    expect(useMusicStore.getState().tracks).toHaveLength(1);
    expect(useMusicStore.getState().tracks[0].id).toBe('track-1');
  });

  it('filters out tracks from excluded folders and short tracks when enabled', async () => {
    useSettingsStore.setState({
      excludedFolders: ['/music/excluded'],
      hideShortTracks: true,
    });

    (localScanner.scanLocalMusicFiles as jest.Mock).mockResolvedValueOnce(mockTracks);

    let hookResult: ReturnType<typeof useLibraryScan>;
    act(() => {
      create(<TestHarness onRender={(res) => (hookResult = res)} />);
    });

    let scanResult: any;
    await act(async () => {
      scanResult = await hookResult!.scan();
    });

    // Only mockTracks[0] should remain
    expect(scanResult.found).toHaveLength(1);
    expect(scanResult.found[0].id).toBe('track-1');
  });

  it('rebuild replaces the entire library with the scan result', async () => {
    useMusicStore.setState({
      tracks: [
        {
          id: 'old-track',
          title: 'Old Track',
          artist: 'Old Artist',
          url: 'file:///music/old.mp3',
          isLocal: true,
        },
      ],
    });

    (localScanner.scanLocalMusicFiles as jest.Mock).mockResolvedValueOnce([mockTracks[0]]);

    let hookResult: ReturnType<typeof useLibraryScan>;
    act(() => {
      create(<TestHarness onRender={(res) => (hookResult = res)} />);
    });

    await act(async () => {
      await hookResult!.rebuild();
    });

    expect(useMusicStore.getState().tracks).toHaveLength(1);
    expect(useMusicStore.getState().tracks[0].id).toBe('track-1');
  });

  it('requestAndScan sets permissionDenied to true when permission is denied', async () => {
    (localScanner.requestStoragePermission as jest.Mock).mockResolvedValueOnce(false);

    let hookResult: ReturnType<typeof useLibraryScan>;
    act(() => {
      create(<TestHarness onRender={(res) => (hookResult = res)} />);
    });

    let scanResult: any;
    await act(async () => {
      scanResult = await hookResult!.requestAndScan();
    });

    expect(hookResult!.permissionDenied).toBe(true);
    expect(scanResult.found).toEqual([]);
    expect(localScanner.scanLocalMusicFiles).not.toHaveBeenCalled();
  });
});
