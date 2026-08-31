import { getAudioFormatLabel } from '../../src/utils/audioFormat';

describe('audioFormat', () => {
  it('returns LOSSLESS for lossless audio formats', () => {
    expect(getAudioFormatLabel({ url: 'file:///music/song.flac', isLocal: true })).toBe('LOSSLESS');
    expect(getAudioFormatLabel({ url: 'file:///music/song.wav', isLocal: true })).toBe('LOSSLESS');
    expect(getAudioFormatLabel({ url: 'file:///music/song.alac', isLocal: true })).toBe('LOSSLESS');
    expect(getAudioFormatLabel({ url: 'file:///music/song.aiff', isLocal: true })).toBe('LOSSLESS');
    expect(getAudioFormatLabel({ url: 'file:///music/song.ape', isLocal: true })).toBe('LOSSLESS');
  });

  it('returns uppercase extension for known lossy audio formats', () => {
    expect(getAudioFormatLabel({ url: 'file:///music/song.mp3', isLocal: true })).toBe('MP3');
    expect(getAudioFormatLabel({ url: 'file:///music/song.aac', isLocal: true })).toBe('AAC');
    expect(getAudioFormatLabel({ url: 'file:///music/song.m4a', isLocal: true })).toBe('M4A');
    expect(getAudioFormatLabel({ url: 'file:///music/song.ogg', isLocal: true })).toBe('OGG');
    expect(getAudioFormatLabel({ url: 'file:///music/song.opus', isLocal: true })).toBe('OPUS');
    expect(getAudioFormatLabel({ url: 'file:///music/song.wma', isLocal: true })).toBe('WMA');
  });

  it('returns null for non-local tracks or empty URLs', () => {
    expect(getAudioFormatLabel({ url: 'https://example.com/song.mp3', isLocal: false })).toBeNull();
    expect(getAudioFormatLabel({ url: '', isLocal: true })).toBeNull();
    expect(getAudioFormatLabel(null)).toBeNull();
    expect(getAudioFormatLabel(undefined)).toBeNull();
  });

  it('returns null for unknown extensions or files without extension', () => {
    expect(getAudioFormatLabel({ url: 'file:///music/song.xyz', isLocal: true })).toBeNull();
    expect(getAudioFormatLabel({ url: 'file:///music/songfile', isLocal: true })).toBeNull();
  });
});
