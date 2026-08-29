export interface LyricLine {
  /** Seconds from the start of the track. */
  time: number;
  text: string;
}

// Matches a leading LRC timestamp tag like [00:12.34] or [1:02:345] — minutes,
// seconds, and an optional fractional part separated by '.' or ':'.
const TIME_TAG_REGEX = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/**
 * Parses standard line-synced LRC lyrics (the format Gramophone and most
 * music players read from a `.lrc` file next to the track). Metadata tags
 * ([ar:...], [ti:...], [offset:...], etc.) and blank lines are ignored —
 * only lines carrying at least one timestamp become lyric lines. A line
 * with multiple timestamps (used for a repeated chorus) produces one entry
 * per timestamp.
 *
 * Word-by-word sync (enhanced LRC's inline <mm:ss.xx> tags) isn't parsed
 * here — line-level sync covers the overwhelming majority of real .lrc
 * files, and falling back to line sync for enhanced files is preferable to
 * not parsing them at all.
 */
export function parseLrc(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];

  raw.split(/\r?\n/).forEach((rawLine) => {
    const matches = Array.from(rawLine.matchAll(TIME_TAG_REGEX));
    if (matches.length === 0) {
      return;
    }

    const text = rawLine.replace(TIME_TAG_REGEX, '').trim();

    matches.forEach((m) => {
      const minutes = parseInt(m[1], 10);
      const seconds = parseInt(m[2], 10);
      const fraction = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) / 1000 : 0;
      lines.push({ time: minutes * 60 + seconds + fraction, text });
    });
  });

  return lines.sort((a, b) => a.time - b.time);
}
