import { useCallback, useState } from 'react';
import { useMusicStore } from '../store/useMusicStore';
import { scanLocalMusicFiles } from '../services/localMusicScanner';
import { Track } from '../types/music';

export interface LibraryScanResult {
  /** Every track the device scan turned up, before de-duplication. */
  found: Track[];
  /** The subset of `found` that wasn't already in the library. */
  added: Track[];
}

/**
 * Scans the device for local audio files and merges newly found tracks into
 * the music store, de-duplicating against the existing library.
 *
 * Shared by HomeScreen, LibraryScreen and SettingsScreen, which all trigger the
 * same scan-and-merge flow from different entry points in the UI.
 */
export function useLibraryScan() {
  const [isScanning, setIsScanning] = useState(false);

  const scan = useCallback(async (): Promise<LibraryScanResult> => {
    setIsScanning(true);
    try {
      const found = await scanLocalMusicFiles();
      let added: Track[] = [];

      if (found.length > 0) {
        const { tracks, setTracks } = useMusicStore.getState();
        const existingIds = new Set(tracks.map((t) => t.id));
        added = found.filter((t) => !existingIds.has(t.id));
        if (added.length > 0) {
          setTracks([...tracks, ...added]);
        }
      }

      return { found, added };
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { isScanning, scan };
}
