import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMusicStore } from '../../src/store/useMusicStore';
import { Track } from '../../src/types/music';

function makeTrack(overrides: Partial<Track> & { id: string }): Track {
  return {
    title: `Title ${overrides.id}`,
    artist: `Artist ${overrides.id}`,
    url: `file:///music/${overrides.id}.mp3`,
    isLocal: true,
    ...overrides,
  };
}

const initialState = useMusicStore.getInitialState();

beforeEach(async () => {
  useMusicStore.setState(initialState, true);
  await AsyncStorage.clear();
});

describe('useMusicStore — queue & playback', () => {
  it('playTrack sets currentTrack, queue and originalQueue, and records history', async () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });

    await useMusicStore.getState().playTrack(a, [a, b]);

    const state = useMusicStore.getState();
    expect(state.currentTrack?.id).toBe('a');
    expect(state.queue.map((t) => t.id)).toEqual(['a', 'b']);
    expect(state.originalQueue.map((t) => t.id)).toEqual(['a', 'b']);
    expect(state.recentlyPlayed[0].id).toBe('a');
  });

  it('playTrack de-duplicates history instead of listing the same track twice', async () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    useMusicStore.setState({ recentlyPlayed: [] });

    await useMusicStore.getState().playTrack(a, [a, b]);
    await useMusicStore.getState().playTrack(b, [a, b]);
    await useMusicStore.getState().playTrack(a, [a, b]);

    const { recentlyPlayed } = useMusicStore.getState();
    expect(recentlyPlayed.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('addToQueue appends without disturbing existing order', () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    useMusicStore.setState({ queue: [a] });

    useMusicStore.getState().addToQueue(b);

    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('playNextTrack inserts right after the currently playing track', () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    const c = makeTrack({ id: 'c' });
    useMusicStore.setState({ queue: [a, b], currentTrack: a });

    useMusicStore.getState().playNextTrack(c);

    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['a', 'c', 'b']);
  });

  it('removeFromQueue drops only the targeted index', () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    const c = makeTrack({ id: 'c' });
    useMusicStore.setState({ queue: [a, b, c] });

    useMusicStore.getState().removeFromQueue(1);

    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['a', 'c']);
  });

  it('moveQueueItem reorders and ignores out-of-range indexes', () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    const c = makeTrack({ id: 'c' });
    useMusicStore.setState({ queue: [a, b, c] });

    useMusicStore.getState().moveQueueItem(0, 2);
    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['b', 'c', 'a']);

    useMusicStore.getState().moveQueueItem(0, 99);
    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('clearQueue keeps only the currently playing track', () => {
    const a = makeTrack({ id: 'a' });
    const b = makeTrack({ id: 'b' });
    useMusicStore.setState({ queue: [a, b], currentTrack: a });

    useMusicStore.getState().clearQueue();

    expect(useMusicStore.getState().queue.map((t) => t.id)).toEqual(['a']);
  });

  it('toggleShuffle reorders only what is ahead of the current track, and restores exact order when toggled off', async () => {
    const tracks = Array.from({ length: 8 }, (_, i) => makeTrack({ id: `t${i}` }));
    const currentIdx = 2;
    useMusicStore.setState({
      queue: tracks,
      originalQueue: tracks,
      currentTrack: tracks[currentIdx],
      isShuffle: false,
    });

    await useMusicStore.getState().toggleShuffle();

    const shuffledState = useMusicStore.getState();
    expect(shuffledState.isShuffle).toBe(true);
    // Everything up to and including the current track is untouched.
    expect(shuffledState.queue.slice(0, currentIdx + 1).map((t) => t.id)).toEqual(
      tracks.slice(0, currentIdx + 1).map((t) => t.id)
    );
    // What's ahead is still the same set of tracks, just possibly reordered.
    const upcomingIds = shuffledState.queue.slice(currentIdx + 1).map((t) => t.id).sort();
    const originalUpcomingIds = tracks.slice(currentIdx + 1).map((t) => t.id).sort();
    expect(upcomingIds).toEqual(originalUpcomingIds);

    await useMusicStore.getState().toggleShuffle();

    const restoredState = useMusicStore.getState();
    expect(restoredState.isShuffle).toBe(false);
    expect(restoredState.queue.map((t) => t.id)).toEqual(tracks.map((t) => t.id));
  });

  it('cycleRepeatMode cycles off -> queue -> track -> off', async () => {
    expect(useMusicStore.getState().repeatMode).toBe('off');
    await useMusicStore.getState().cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('queue');
    await useMusicStore.getState().cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('track');
    await useMusicStore.getState().cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('off');
  });
});

describe('useMusicStore — favorites & history', () => {
  it('toggleFavorite adds then removes a track id', async () => {
    await useMusicStore.getState().toggleFavorite('x');
    expect(useMusicStore.getState().favorites).toContain('x');

    await useMusicStore.getState().toggleFavorite('x');
    expect(useMusicStore.getState().favorites).not.toContain('x');
  });

  it('clearHistory empties recentlyPlayed', () => {
    useMusicStore.setState({ recentlyPlayed: [makeTrack({ id: 'a' })] });
    useMusicStore.getState().clearHistory();
    expect(useMusicStore.getState().recentlyPlayed).toEqual([]);
  });
});

describe('useMusicStore — library maintenance', () => {
  it('removeTracksInFolder only removes tracks from that folder', () => {
    const kept = makeTrack({ id: 'kept', folderPath: '/music/keep' });
    const removed = makeTrack({ id: 'removed', folderPath: '/music/drop' });
    useMusicStore.setState({ tracks: [kept, removed] });

    useMusicStore.getState().removeTracksInFolder('/music/drop');

    expect(useMusicStore.getState().tracks.map((t) => t.id)).toEqual(['kept']);
  });
});

describe('useMusicStore — playlists', () => {
  it('createPlaylist adds a new playlist with no tracks', async () => {
    const before = useMusicStore.getState().playlists.length;
    const created = await useMusicStore.getState().createPlaylist('Road Trip', 'Songs for the road');

    expect(useMusicStore.getState().playlists.length).toBe(before + 1);
    expect(created.name).toBe('Road Trip');
    expect(created.trackIds).toEqual([]);
  });

  it('addTrackToPlaylist does not add the same track twice', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Focus');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');

    const updated = useMusicStore.getState().playlists.find((p) => p.id === playlist.id);
    expect(updated?.trackIds).toEqual(['song-1']);
  });

  it('removeTrackFromPlaylist removes only the targeted track', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Focus');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-2');

    await useMusicStore.getState().removeTrackFromPlaylist(playlist.id, 'song-1');

    const updated = useMusicStore.getState().playlists.find((p) => p.id === playlist.id);
    expect(updated?.trackIds).toEqual(['song-2']);
  });

  it('renamePlaylist updates name and description without touching trackIds', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Old Name');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');

    await useMusicStore.getState().renamePlaylist(playlist.id, 'New Name', 'New description');

    const updated = useMusicStore.getState().playlists.find((p) => p.id === playlist.id);
    expect(updated?.name).toBe('New Name');
    expect(updated?.description).toBe('New description');
    expect(updated?.trackIds).toEqual(['song-1']);
  });

  it('reorderPlaylistTracks moves a track id to a new position (regression: PlaylistDetailScreen relies on this order)', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Ordered');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-2');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-3');

    await useMusicStore.getState().reorderPlaylistTracks(playlist.id, 0, 2);

    const updated = useMusicStore.getState().playlists.find((p) => p.id === playlist.id);
    expect(updated?.trackIds).toEqual(['song-2', 'song-3', 'song-1']);
  });

  it('reorderPlaylistTracks ignores out-of-range indexes instead of corrupting the list', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Ordered');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-1');
    await useMusicStore.getState().addTrackToPlaylist(playlist.id, 'song-2');

    await useMusicStore.getState().reorderPlaylistTracks(playlist.id, 0, 5);

    const updated = useMusicStore.getState().playlists.find((p) => p.id === playlist.id);
    expect(updated?.trackIds).toEqual(['song-1', 'song-2']);
  });

  it('deletePlaylist removes it from the list', async () => {
    const playlist = await useMusicStore.getState().createPlaylist('Temporary');
    await useMusicStore.getState().deletePlaylist(playlist.id);

    expect(useMusicStore.getState().playlists.find((p) => p.id === playlist.id)).toBeUndefined();
  });
});

describe('useMusicStore — initStore', () => {
  it('restores favorites, playlists and tracks from AsyncStorage', async () => {
    const savedTrack = makeTrack({ id: 'restored' });
    await AsyncStorage.setItem('@moozy_favorites_v1', JSON.stringify(['restored']));
    await AsyncStorage.setItem('@moozy_tracks_v1', JSON.stringify([savedTrack]));

    await useMusicStore.getState().initStore();

    const state = useMusicStore.getState();
    expect(state.favorites).toEqual(['restored']);
    expect(state.tracks.map((t) => t.id)).toEqual(['restored']);
  });

  it('does not restore a playback session when resumeOnStartup is disabled', async () => {
    const track = makeTrack({ id: 'resume-me' });
    await AsyncStorage.setItem('@moozy_current_track_v1', JSON.stringify(track));
    await AsyncStorage.setItem('@moozy_queue_v1', JSON.stringify(['resume-me']));

    const { useSettingsStore } = require('../../src/store/useSettingsStore');
    useSettingsStore.setState({ resumeOnStartup: false });

    await useMusicStore.getState().initStore();

    expect(useMusicStore.getState().currentTrack).toBeNull();
  });

  it('does not throw when a persisted value is corrupted JSON', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem('@moozy_favorites_v1', 'not valid json{{{');

    await expect(useMusicStore.getState().initStore()).resolves.toBeUndefined();

    warnSpy.mockRestore();
  });
});
