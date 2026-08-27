import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodCategory, Playlist, RepeatMode, Track } from '../types/music';
import { AudioService } from '../services/audioService';

const FAVORITES_STORAGE_KEY = '@moozy_favorites_v1';
const PLAYLISTS_STORAGE_KEY = '@moozy_playlists_v1';
const HISTORY_STORAGE_KEY = '@moozy_history_v1';

export const INITIAL_DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    title: 'Midnight City Drive',
    artist: 'Aura Soundscapes',
    album: 'Neon Horizons',
    duration: 215,
    genre: 'Synthwave / Electronic',
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    isFavorite: true,
  },
  {
    id: 'demo-2',
    title: 'Cosmic Drift',
    artist: 'Solaris Waves',
    album: 'Astral Echoes',
    duration: 260,
    genre: 'Lo-Fi / Chillout',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    isFavorite: false,
  },
  {
    id: 'demo-3',
    title: 'Deep Focus Pulse',
    artist: 'Velvet Horizon',
    album: 'Mindful Echo',
    duration: 198,
    genre: 'Ambient / Focus',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    isFavorite: true,
  },
  {
    id: 'demo-4',
    title: 'Hyperdrive Energy',
    artist: 'Pulse Kinetic',
    album: 'Velocity Shift',
    duration: 245,
    genre: 'Cyberpunk / EDM',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    isFavorite: false,
  },
  {
    id: 'demo-5',
    title: 'Autumn Rain Melody',
    artist: 'Luna Serenade',
    album: 'Acoustic Soul',
    duration: 180,
    genre: 'Acoustic / Indie',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    isFavorite: false,
  },
];

interface MusicStoreState {
  tracks: Track[];
  currentTrack: Track | null;
  queue: Track[];
  favorites: string[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  searchQuery: string;
  selectedMood: MoodCategory;
  isLoadingMedia: boolean;

  // Actions
  initStore: () => Promise<void>;
  setTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  playTrack: (track: Track, queueList?: Track[]) => Promise<void>;
  playNextTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  toggleFavorite: (trackId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedMood: (mood: MoodCategory) => void;
  setLoadingMedia: (loading: boolean) => void;
}

export const useMusicStore = create<MusicStoreState>((set, get) => ({
  tracks: INITIAL_DEMO_TRACKS,
  currentTrack: INITIAL_DEMO_TRACKS[0],
  queue: INITIAL_DEMO_TRACKS,
  favorites: ['demo-1', 'demo-3'],
  playlists: [
    {
      id: 'pl-favorites',
      name: 'Coups de Cœur ❤️',
      description: 'Vos morceaux préférés rassemblés',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      trackIds: ['demo-1', 'demo-3'],
      createdAt: Date.now(),
    },
    {
      id: 'pl-chill',
      name: 'Late Night Chill 🌙',
      description: 'Ambiance relaxante & onirique',
      artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      trackIds: ['demo-2', 'demo-3', 'demo-5'],
      createdAt: Date.now(),
    },
  ],
  recentlyPlayed: [INITIAL_DEMO_TRACKS[0], INITIAL_DEMO_TRACKS[1]],
  repeatMode: 'off',
  isShuffle: false,
  searchQuery: '',
  selectedMood: 'all',
  isLoadingMedia: false,

  initStore: async () => {
    try {
      const [favsJson, plsJson, histJson] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
        AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
      ]);

      if (favsJson) {
        set({ favorites: JSON.parse(favsJson) });
      }
      if (plsJson) {
        set({ playlists: JSON.parse(plsJson) });
      }
      if (histJson) {
        set({ recentlyPlayed: JSON.parse(histJson) });
      }
    } catch (e) {
      console.warn('Failed to load persisted music data:', e);
    }
  },

  setTracks: (tracks) => set({ tracks }),

  setCurrentTrack: (track) => set({ currentTrack: track }),

  playTrack: async (track, queueList) => {
    const effectiveQueue = queueList || get().tracks;
    set({
      currentTrack: track,
      queue: effectiveQueue,
      recentlyPlayed: [track, ...get().recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 20),
    });

    // Persist history
    AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(get().recentlyPlayed)
    ).catch(console.warn);

    await AudioService.playTrack(track, effectiveQueue);
  },

  playNextTrack: (track) => {
    const { queue, currentTrack } = get();
    const currentIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : 0;
    const insertIdx = currentIdx >= 0 ? currentIdx + 1 : 0;

    // Filter out if already immediately next
    const updated = [...queue];
    updated.splice(insertIdx, 0, track);
    set({ queue: updated });
  },

  addToQueue: (track) => {
    const { queue } = get();
    set({ queue: [...queue, track] });
  },

  removeFromQueue: (index) => {
    const { queue } = get();
    const updated = queue.filter((_, i) => i !== index);
    set({ queue: updated });
  },

  moveQueueItem: (fromIndex, toIndex) => {
    const { queue } = get();
    if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) {
      return;
    }
    const updated = [...queue];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    set({ queue: updated });
  },

  clearQueue: () => {
    const { currentTrack } = get();
    set({ queue: currentTrack ? [currentTrack] : [] });
  },

  toggleFavorite: async (trackId) => {
    const { favorites } = get();
    const isFav = favorites.includes(trackId);
    const updatedFavorites = isFav
      ? favorites.filter((id) => id !== trackId)
      : [...favorites, trackId];

    set({ favorites: updatedFavorites });
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
  },

  createPlaylist: async (name, description) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      trackIds: [],
      createdAt: Date.now(),
    };

    const updated = [newPlaylist, ...get().playlists];
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
    return newPlaylist;
  },

  deletePlaylist: async (playlistId) => {
    const updated = get().playlists.filter((p) => p.id !== playlistId);
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    const updated = get().playlists.map((pl) => {
      if (pl.id === playlistId && !pl.trackIds.includes(trackId)) {
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      }
      return pl;
    });
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    const updated = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
      }
      return pl;
    });
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  },

  toggleShuffle: () => {
    const newShuffle = !get().isShuffle;
    set({ isShuffle: newShuffle });
  },

  cycleRepeatMode: async () => {
    const current = get().repeatMode;
    let next: RepeatMode = 'off';
    if (current === 'off') {
      next = 'queue';
    } else if (current === 'queue') {
      next = 'track';
    } else if (current === 'track') {
      next = 'off';
    }

    set({ repeatMode: next });
    await AudioService.setRepeatMode(next);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedMood: (mood) => set({ selectedMood: mood }),

  setLoadingMedia: (loading) => set({ isLoadingMedia: loading }),
}));
