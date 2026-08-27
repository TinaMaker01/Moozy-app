import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Track } from '../types/music';

const SUPPORTED_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg'];

export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const sdkInt = Platform.constants.Version as number;

    if (sdkInt >= 33) {
      const granted = await PermissionsAndroid.request(
        // @ts-ignore
        'android.permission.READ_MEDIA_AUDIO',
        {
          title: 'Permission Audio Moozy',
          message: 'Moozy a besoin d’accéder à vos fichiers audio pour les jouer.',
          buttonPositive: 'Autoriser',
          buttonNegative: 'Refuser',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission Stockage Moozy',
          message: 'Moozy a besoin d’accéder à votre stockage pour trouver vos musiques.',
          buttonPositive: 'Autoriser',
          buttonNegative: 'Refuser',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn('Storage permission request failed', err);
    return false;
  }
}

function cleanTitle(fileName: string): { title: string; artist: string } {
  // Remove extension
  const base = fileName.replace(/\.[^/.]+$/, '');

  // Try to parse "Artist - Title"
  if (base.includes(' - ')) {
    const parts = base.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }

  // Try "Artist _ Title"
  if (base.includes(' _ ')) {
    const parts = base.split(' _ ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' _ ').trim(),
    };
  }

  return {
    title: base.replace(/_/g, ' '),
    artist: 'Artiste Inconnu',
  };
}

export async function scanLocalMusicFiles(): Promise<Track[]> {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    console.warn('Storage permission denied');
    return [];
  }

  const discoveredTracks: Track[] = [];
  const directoriesToScan: string[] = [];

  if (Platform.OS === 'android') {
    const extPath = RNFS.ExternalStorageDirectoryPath;
    directoriesToScan.push(
      `${extPath}/Music`,
      `${extPath}/Download`,
      `${extPath}/Audiobooks`,
      `${extPath}/Podcasts`,
      `${extPath}/Recordings`,
      RNFS.DocumentDirectoryPath
    );
  } else {
    directoriesToScan.push(
      RNFS.DocumentDirectoryPath,
      RNFS.MainBundlePath
    );
  }

  const visitedDirs = new Set<string>();

  async function scanDirectory(dirPath: string, depth = 0) {
    if (depth > 4 || visitedDirs.has(dirPath)) {
      return;
    }
    visitedDirs.add(dirPath);

    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        return;
      }

      const items = await RNFS.readDir(dirPath);
      for (const item of items) {
        if (item.isDirectory()) {
          // Avoid scanning system, android data, or hidden folders
          if (!item.name.startsWith('.') && item.name !== 'Android') {
            await scanDirectory(item.path, depth + 1);
          }
        } else if (item.isFile()) {
          const lowerName = item.name.toLowerCase();
          const isAudio = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

          if (isAudio && item.size > 200000) { // Ignore clips < ~200KB
            const { title, artist } = cleanTitle(item.name);
            discoveredTracks.push({
              id: `local-${item.path}`,
              url: `file://${item.path}`,
              title,
              artist,
              album: 'Musique Locale',
              // No real duration available without reading the file's audio tags —
              // left unset (optional field) so the UI shows "--:--" instead of a
              // fabricated value.
              artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
              isLocal: true,
              isFavorite: false,
              addedAt: Date.now(),
            });
          }
        }
      }
    } catch (e) {
      // Directory inaccessible or restricted, skip quietly
    }
  }

  for (const dir of directoriesToScan) {
    await scanDirectory(dir, 0);
  }

  return discoveredTracks;
}
