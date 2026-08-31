import { NativeModules } from 'react-native';
import { Track } from '../types/music';

interface NativeMediaStoreTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  duration: number; // seconds
  path: string;
  dateAdded: number; // unix seconds
  size: number;
  artworkUri: string;
}

interface MediaScannerNativeModule {
  scanAudioFiles(): Promise<NativeMediaStoreTrack[]>;
}

function getMediaScanner(): MediaScannerNativeModule | undefined {
  return NativeModules.MediaScanner as MediaScannerNativeModule | undefined;
}

/** Whether the native MediaStore-backed scanner is available (Android only). */
export function hasNativeLibraryScanner(): boolean {
  return !!getMediaScanner()?.scanAudioFiles;
}

function folderPathOf(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  return lastSlash > 0 ? filePath.slice(0, lastSlash) : filePath;
}

/**
 * Lists the device's audio library via Android's MediaStore index (see
 * MediaScannerModule.kt) instead of walking the filesystem and guessing
 * metadata from file names — real title/artist/album/duration, and an
 * album-art URI, straight from what the OS already indexed.
 */
export async function scanAudioFilesNative(): Promise<Track[]> {
  const scanner = getMediaScanner();
  if (!scanner?.scanAudioFiles) {
    return [];
  }

  const rows = await scanner.scanAudioFiles();

  return rows.map((row): Track => ({
    id: `local-${row.id}`,
    url: `file://${row.path}`,
    title: row.title || row.path.split('/').pop() || 'Titre inconnu',
    artist: row.artist && row.artist !== '<unknown>' ? row.artist : 'Artiste Inconnu',
    album: row.album && row.album !== '<unknown>' ? row.album : undefined,
    albumId: row.albumId,
    duration: row.duration > 0 ? row.duration : undefined,
    // Not every track has embedded/indexed art — a failed load here falls
    // back to the generic music icon in <TrackArtwork>, not a broken image.
    artwork: row.artworkUri,
    isLocal: true,
    isFavorite: false,
    addedAt: row.dateAdded > 0 ? row.dateAdded * 1000 : Date.now(),
    folderPath: folderPathOf(row.path),
  }));
}
