import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodCategory, Playlist, RepeatMode, Track } from '../types/music';
import { AudioService } from '../services/audioService';
import {
  CURRENT_TRACK_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  PLAYBACK_POSITION_STORAGE_KEY,
  PLAYLISTS_STORAGE_KEY,
  QUEUE_STORAGE_KEY,
  REPEAT_MODE_STORAGE_KEY,
  SHUFFLE_STORAGE_KEY,
  TRACKS_STORAGE_KEY,
} from '../constants/storageKeys';

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

function persistQueue(queue: Track[]) {
  AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue)).catch(console.warn);
}

interface MusicStoreState {
  tracks: Track[];
  currentTrack: Track | null;
  queue: Track[];
  /** The queue in its pre-shuffle order, so toggling shuffle off can restore it. */
  originalQueue: Track[];
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
  renamePlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeatMode: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedMood: (mood: MoodCategory) => void;
  setLoadingMedia: (loading: boolean) => void;
}

export const useMusicStore = create<MusicStoreState>((set, get) => ({
  tracks: INITIAL_DEMO_TRACKS,
  // No track is "current" until the user actually plays one, or a previous
  // session is restored below in initStore — showing a demo track as
  // playing before anything was ever tapped made the mini-player appear
  // with a phantom now-playing card that wasn't actually loaded in the
  // native player.
  currentTrack: null,
  queue: INITIAL_DEMO_TRACKS,
  originalQueue: INITIAL_DEMO_TRACKS,
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
      const [
        favsJson,
        plsJson,
        histJson,
        tracksJson,
        currentTrackJson,
        queueJson,
        repeatModeJson,
        shuffleJson,
        positionJson,
      ] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
        AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
        AsyncStorage.getItem(TRACKS_STORAGE_KEY),
        AsyncStorage.getItem(CURRENT_TRACK_STORAGE_KEY),
        AsyncStorage.getItem(QUEUE_STORAGE_KEY),
        AsyncStorage.getItem(REPEAT_MODE_STORAGE_KEY),
        AsyncStorage.getItem(SHUFFLE_STORAGE_KEY),
        AsyncStorage.getItem(PLAYBACK_POSITION_STORAGE_KEY),
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
      if (tracksJson) {
        set({ tracks: JSON.parse(tracksJson) });
      }

      // Restore the last playback session — reloads the track into the
      // native player and seeks to where the user left off, but stays
      // paused rather than auto-blasting audio the moment the app opens.
      if (currentTrackJson) {
        const restoredTrack: Track = JSON.parse(currentTrackJson);
        const restoredQueue: Track[] = queueJson ? JSON.parse(queueJson) : [restoredTrack];
        const restoredRepeat: RepeatMode = repeatModeJson ? JSON.parse(repeatModeJson) : 'off';
        const restoredShuffle: boolean = shuffleJson ? JSON.parse(shuffleJson) : false;
        const restoredPosition: number = positionJson ? JSON.parse(positionJson) : 0;

        set({
          currentTrack: restoredTrack,
          queue: restoredQueue,
          originalQueue: restoredQueue,
          repeatMode: restoredRepeat,
          isShuffle: restoredShuffle,
        });

        try {
          await AudioService.loadForRestore(restoredTrack, restoredQueue, restoredPosition);
          await AudioService.setRepeatMode(restoredRepeat);
        } catch (e) {
          console.warn('Failed to restore the previous playback session:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted music data:', e);
    }
  },

  setTracks: (tracks) => {
    set({ tracks });
    // Persist so a locally-scanned library survives an app restart instead of
    // requiring the user to rescan every time.
    AsyncStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks)).catch(console.warn);
  },

  setCurrentTrack: (track) => set({ currentTrack: track }),

  playTrack: async (track, queueList) => {
    const effectiveQueue = queueList || get().tracks;
    set({
      currentTrack: track,
      queue: effectiveQueue,
      // The queue as requested (e.g. by tapping a song in the Library tab)
      // is always the canonical, unshuffled order — shuffle only reorders
      // what's ahead of it from here, in toggleShuffle below.
      originalQueue: effectiveQueue,
      recentlyPlayed: [track, ...get().recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 20),
    });

    // Persist history + the session itself (so killing/reopening the app
    // resumes here instead of losing track of what was playing).
    AsyncStorage.multiSet([
      [HISTORY_STORAGE_KEY, JSON.stringify(get().recentlyPlayed)],
      [CURRENT_TRACK_STORAGE_KEY, JSON.stringify(track)],
      [QUEUE_STORAGE_KEY, JSON.stringify(effectiveQueue)],
      [PLAYBACK_POSITION_STORAGE_KEY, '0'],
    ]).catch(console.warn);

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
    persistQueue(updated);
    AudioService.insertTrack(track, insertIdx).catch(console.warn);
  },

  addToQueue: (track) => {
    const { queue } = get();
    const updated = [...queue, track];
    set({ queue: updated });
    persistQueue(updated);
    AudioService.addToQueue(track).catch(console.warn);
  },

  removeFromQueue: (index) => {
    const { queue } = get();
    const updated = queue.filter((_, i) => i !== index);
    set({ queue: updated });
    persistQueue(updated);
    AudioService.removeAt(index).catch(console.warn);
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
    persistQueue(updated);
    AudioService.moveTrack(fromIndex, toIndex).catch(console.warn);
  },

  clearQueue: () => {
    const { currentTrack } = get();
    const updated = currentTrack ? [currentTrack] : [];
    set({ queue: updated });
    persistQueue(updated);
    AudioService.setUpcomingQueue([]).catch(console.warn);
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

  renamePlaylist: async (playlistId, name, description) => {
    const updated = get().playlists.map((pl) =>
      pl.id === playlistId ? { ...pl, name, description } : pl
    );
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  },

  reorderPlaylistTracks: async (playlistId, fromIndex, toIndex) => {
    const updated = get().playlists.map((pl) => {
      if (pl.id !== playlistId) {
        return pl;
      }
      if (
        fromIndex < 0 ||
        fromIndex >= pl.trackIds.length ||
        toIndex < 0 ||
        toIndex >= pl.trackIds.length
      ) {
        return pl;
      }
      const trackIds = [...pl.trackIds];
      const [moved] = trackIds.splice(fromIndex, 1);
      trackIds.splice(toIndex, 0, moved);
      return { ...pl, trackIds };
    });
    set({ playlists: updated });
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  },

  toggleShuffle: async () => {
    const { isShuffle, queue, originalQueue, currentTrack } = get();
    const newShuffle = !isShuffle;
    set({ isShuffle: newShuffle });
    AsyncStorage.setItem(SHUFFLE_STORAGE_KEY, JSON.stringify(newShuffle)).catch(console.warn);

    if (!currentTrack) {
      return;
    }
    const currentIdx = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIdx < 0) {
      return;
    }

    if (newShuffle) {
      // Shuffle everything still ahead of the currently playing track
      // (Fisher-Yates), leaving what's already played untouched.
      const upcoming = queue.slice(currentIdx + 1);
      for (let i = upcoming.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
      }
      const updatedQueue = [...queue.slice(0, currentIdx + 1), ...upcoming];
      set({ queue: updatedQueue });
      persistQueue(updatedQueue);
      await AudioService.setUpcomingQueue(upcoming);
    } else {
      // Restore the pre-shuffle order for whatever's left to play.
      const remainingIds = new Set(queue.slice(currentIdx + 1).map((t) => t.id));
      const restored = originalQueue.filter(
        (t) => remainingIds.has(t.id) && t.id !== currentTrack.id
      );
      const updatedQueue = [...queue.slice(0, currentIdx + 1), ...restored];
      set({ queue: updatedQueue });
      persistQueue(updatedQueue);
      await AudioService.setUpcomingQueue(restored);
    }
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
    AsyncStorage.setItem(REPEAT_MODE_STORAGE_KEY, JSON.stringify(next)).catch(console.warn);
    await AudioService.setRepeatMode(next);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedMood: (mood) => set({ selectedMood: mood }),

  setLoadingMedia: (loading) => set({ isLoadingMedia: loading }),
}));
