import RNFS from 'react-native-fs';
import { findLyricsForTrack } from '../../src/services/lyricsService';
import { Track } from '../../src/types/music';

jest.mock('react-native-fs', () => ({
  exists: jest.fn(),
  readFile: jest.fn(),
}));

describe('lyricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const localTrack: Track = {
    id: 'local-1',
    title: 'Test Song',
    artist: 'Test Artist',
    url: 'file:///storage/emulated/0/Music/Test Song.mp3',
    isLocal: true,
  };

  const remoteTrack: Track = {
    id: 'remote-1',
    title: 'Remote Song',
    artist: 'Remote Artist',
    url: 'https://example.com/audio.mp3',
    isLocal: false,
  };

  it('returns null immediately for non-local or non-file:// tracks', async () => {
    const resultRemote = await findLyricsForTrack(remoteTrack);
    expect(resultRemote).toBeNull();
    expect(RNFS.exists).not.toHaveBeenCalled();

    const resultNonFile = await findLyricsForTrack({
      ...localTrack,
      url: 'content://media/external/audio/media/123',
    });
    expect(resultNonFile).toBeNull();
    expect(RNFS.exists).not.toHaveBeenCalled();
  });

  it('returns null if .lrc sidecar file does not exist', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);

    const result = await findLyricsForTrack(localTrack);

    expect(RNFS.exists).toHaveBeenCalledWith('/storage/emulated/0/Music/Test Song.lrc');
    expect(result).toBeNull();
    expect(RNFS.readFile).not.toHaveBeenCalled();
  });

  it('reads and parses lyrics when .lrc file exists and has valid lines', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
    const mockLrcContent = `
[ti:Test Song]
[ar:Test Artist]
[00:10.50]First line of lyrics
[00:20.00]Second line of lyrics
    `;
    (RNFS.readFile as jest.Mock).mockResolvedValueOnce(mockLrcContent);

    const result = await findLyricsForTrack(localTrack);

    expect(result).toEqual([
      { time: 10.5, text: 'First line of lyrics' },
      { time: 20, text: 'Second line of lyrics' },
    ]);
  });

  it('returns null if .lrc file exists but contains no valid timestamped lines', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
    (RNFS.readFile as jest.Mock).mockResolvedValueOnce('[ti:Header Only]\n[ar:Artist]');

    const result = await findLyricsForTrack(localTrack);

    expect(result).toBeNull();
  });

  it('returns null if RNFS.readFile throws an error', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
    (RNFS.readFile as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));

    const result = await findLyricsForTrack(localTrack);

    expect(result).toBeNull();
  });
});
