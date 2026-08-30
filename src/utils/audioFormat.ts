const LOSSLESS_EXTENSIONS = ['flac', 'wav', 'alac', 'aiff', 'ape'];
const KNOWN_LOSSY_EXTENSIONS = ['mp3', 'aac', 'm4a', 'ogg', 'opus', 'wma'];

/**
 * Best-effort, honest label for the audio-format badge in the Player —
 * derived from the actual file extension being played, never a fixed
 * "HI-RES LOSSLESS" claim shown for every track regardless of its real
 * format. Showing an unverified quality badge is exactly the kind of
 * unearned claim that makes an app feel like an unfinished prototype (see
 * Phase 15's first-open UX audit). Returns null when nothing honest can be
 * said — e.g. no URL, or a non-local/streamed source.
 */
export function getAudioFormatLabel(
  track: { url?: string; isLocal?: boolean } | null | undefined
): string | null {
  if (!track?.url || !track.isLocal) {
    return null;
  }
  const match = track.url.match(/\.([a-z0-9]+)$/i);
  if (!match) {
    return null;
  }
  const ext = match[1].toLowerCase();
  if (LOSSLESS_EXTENSIONS.includes(ext)) {
    return 'LOSSLESS';
  }
  if (KNOWN_LOSSY_EXTENSIONS.includes(ext)) {
    return ext.toUpperCase();
  }
  return null;
}
