import { parseLrc } from '../../src/utils/lrcParser';

describe('parseLrc', () => {
  it('parses a basic line-synced LRC file', () => {
    const raw = ['[00:12.34]First line', '[00:15.67]Second line'].join('\n');

    expect(parseLrc(raw)).toEqual([
      { time: 12.34, text: 'First line' },
      { time: 15.67, text: 'Second line' },
    ]);
  });

  it('ignores metadata tags with no timestamp', () => {
    const raw = ['[ar:Some Artist]', '[ti:Some Title]', '[00:05.00]Actual lyric'].join('\n');

    expect(parseLrc(raw)).toEqual([{ time: 5, text: 'Actual lyric' }]);
  });

  it('ignores blank lines', () => {
    const raw = ['[00:01.00]Line one', '', '   ', '[00:02.00]Line two'].join('\n');

    expect(parseLrc(raw)).toEqual([
      { time: 1, text: 'Line one' },
      { time: 2, text: 'Line two' },
    ]);
  });

  it('produces one entry per timestamp for a repeated line (multiple tags on one line)', () => {
    const raw = '[00:10.00][00:40.00]Chorus';

    expect(parseLrc(raw)).toEqual([
      { time: 10, text: 'Chorus' },
      { time: 40, text: 'Chorus' },
    ]);
  });

  it('handles a 2-digit fractional part the same as a 3-digit one', () => {
    const raw = ['[00:01.50]A', '[00:02.500]B'].join('\n');

    expect(parseLrc(raw)).toEqual([
      { time: 1.5, text: 'A' },
      { time: 2.5, text: 'B' },
    ]);
  });

  it('handles minute values beyond 59 and lines with no fractional part', () => {
    const raw = '[75:00]Long track marker';

    expect(parseLrc(raw)).toEqual([{ time: 75 * 60, text: 'Long track marker' }]);
  });

  it('keeps an instrumental line (timestamp with empty text) instead of dropping it', () => {
    const raw = '[01:00.00]';

    expect(parseLrc(raw)).toEqual([{ time: 60, text: '' }]);
  });

  it('sorts lines by time regardless of file order', () => {
    const raw = ['[00:30.00]Later', '[00:05.00]Earlier'].join('\n');

    expect(parseLrc(raw).map((l) => l.text)).toEqual(['Earlier', 'Later']);
  });

  it('returns an empty array for content with no timestamps at all', () => {
    expect(parseLrc('just some random text\nwith no tags')).toEqual([]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseLrc('')).toEqual([]);
  });
});
