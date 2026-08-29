import RNFS from 'react-native-fs';
import { Track } from '../types/music';
import { LyricLine, parseLrc } from '../utils/lrcParser';

/**
 * Local tracks are the only ones that can have lyrics: the convention is a
 * `.lrc` sidecar file next to the audio file, sharing its base name (e.g.
 * `Song.mp3` + `Song.lrc`) — this is what Gramophone and most Android music
 * players read from. There's no lyrics source at all for demo/remote tracks.
 */
function lrcPathFor(track: Track): string | null {
  if (!track.isLocal || !track.url.startsWith('file://')) {
    return null;
  }
  const filePath = track.url.replace('file://', '');
  const lastDot = filePath.lastIndexOf('.');
  const withoutExt = lastDot > 0 ? filePath.slice(0, lastDot) : filePath;
  return `${withoutExt}.lrc`;
}

/**
 * Looks for and parses a `.lrc` file for `track`. Returns null (never
 * throws) when there's no lyrics source, the file doesn't exist, or it
 * fails to parse into any usable line — callers should treat null as
 * "show the no-lyrics empty state", not as an error.
 */
export async function findLyricsForTrack(track: Track): Promise<LyricLine[] | null> {
  const lrcPath = lrcPathFor(track);
  if (!lrcPath) {
    return null;
  }

  try {
    const exists = await RNFS.exists(lrcPath);
    if (!exists) {
      return null;
    }
    const raw = await RNFS.readFile(lrcPath, 'utf8');
    const parsed = parseLrc(raw);
    return parsed.length > 0 ? parsed : null;
  } catch (e) {
    return null;
  }
}
