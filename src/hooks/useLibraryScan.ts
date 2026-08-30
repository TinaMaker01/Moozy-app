import { useCallback, useState } from 'react';
import { useMusicStore } from '../store/useMusicStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { requestStoragePermission, scanLocalMusicFiles } from '../services/localMusicScanner';
import { Track } from '../types/music';

export interface LibraryScanResult {
  /** Every track the device scan turned up, before de-duplication. */
  found: Track[];
  /** The subset of `found` that wasn't already in the library. */
  added: Track[];
}

const MIN_SHORT_TRACK_SECONDS = 30;

/** Applies the user's Bibliothèque settings (excluded folders, hide-short-tracks) to a fresh scan result. */
function applyLibraryFilters(found: Track[]): Track[] {
  const { excludedFolders, hideShortTracks } = useSettingsStore.getState();
  return found.filter((t) => {
    if (t.folderPath && excludedFolders.includes(t.folderPath)) {
      return false;
    }
    if (hideShortTracks && (t.duration ?? Infinity) < MIN_SHORT_TRACK_SECONDS) {
      return false;
    }
    return true;
  });
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
  // Distinguishes "the OS denied the audio permission" from "permission was
  // granted but the device genuinely has no audio files" — scanLocalMusicFiles
  // silently returns an empty array for both, which isn't enough to render
  // the right first-run empty state (see requestAndScan below).
  const [permissionDenied, setPermissionDenied] = useState(false);

  const scan = useCallback(async (): Promise<LibraryScanResult> => {
    setIsScanning(true);
    try {
      const rawFound = await scanLocalMusicFiles();
      const found = applyLibraryFilters(rawFound);
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

  /**
   * Full rescan that *replaces* the library instead of merging into it — the
   * regular scan only ever adds newly found tracks, so a file deleted or
   * moved off the device stays listed forever until this runs.
   */
  const rebuild = useCallback(async (): Promise<Track[]> => {
    setIsScanning(true);
    try {
      const rawFound = await scanLocalMusicFiles();
      const found = applyLibraryFilters(rawFound);
      useMusicStore.getState().setTracks(found);
      return found;
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * First-run entry point: explicitly requests the audio permission itself
   * (rather than relying on scanLocalMusicFiles' internal, silent check) so
   * the caller can tell a refusal apart from an empty device and show the
   * right empty state — "autorisez l'accès" vs. "aucun fichier audio trouvé".
   */
  const requestAndScan = useCallback(async (): Promise<LibraryScanResult> => {
    setPermissionDenied(false);
    const granted = await requestStoragePermission();
    if (!granted) {
      setPermissionDenied(true);
      return { found: [], added: [] };
    }
    return scan();
  }, [scan]);

  return { isScanning, permissionDenied, scan, rebuild, requestAndScan };
}
