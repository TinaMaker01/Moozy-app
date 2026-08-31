import { getTrackPalette } from '../../src/utils/artworkColors';

describe('artworkColors', () => {
  it('returns default palette for empty title or id', () => {
    const palette = getTrackPalette('');
    expect(palette).toBeDefined();
    expect(palette.primary).toBe('#8B5CF6');
  });

  it('generates consistent deterministic palettes for the same input string', () => {
    const paletteA1 = getTrackPalette('Song A');
    const paletteA2 = getTrackPalette('Song A');

    expect(paletteA1).toEqual(paletteA2);
    expect(paletteA1).toBeDefined();
    expect(paletteA1.primary).toBeDefined();
    expect(paletteA1.glowPrimary).toBeDefined();
    expect(paletteA1.backgroundTint).toBeDefined();
  });

  it('selects different palettes across varied titles', () => {
    const palette1 = getTrackPalette('a'); // charCode 97 -> index 1
    const palette2 = getTrackPalette('b'); // charCode 98 -> index 2
    expect(palette1).not.toEqual(palette2);
  });
});
