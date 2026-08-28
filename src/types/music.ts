export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  /** MediaStore album id, used to group tracks into albums and to resolve album art. Android-only. */
  albumId?: string;
  duration?: number; // In seconds
  artwork?: string;
  genre?: string;
  isFavorite?: boolean;
  isLocal?: boolean;
  addedAt?: number;
  /** Parent directory of the file on disk, used by the Library's Folders view. Android-only. */
  folderPath?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  trackIds: string[];
  createdAt: number;
}

export type RepeatMode = 'off' | 'track' | 'queue';

export type EqualizerPreset =
  | 'Flat'
  | 'Bass Boost'
  | 'Vocal Boost'
  | 'Electronic'
  | 'Rock'
  | 'Pop'
  | 'Acoustic'
  | 'Jazz';

export interface EqualizerSettings {
  preset: EqualizerPreset;
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100
  bands: {
    hz60: number; // -10 to +10 dB
    hz230: number;
    hz910: number;
    hz3600: number;
    hz14000: number;
  };
}

export type MoodCategory = 'all' | 'chill' | 'energy' | 'focus' | 'party' | 'acoustic';
