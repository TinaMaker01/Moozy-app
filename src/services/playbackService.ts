import TrackPlayer, { Event } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_TRACK_STORAGE_KEY, PLAYBACK_POSITION_STORAGE_KEY } from '../constants/storageKeys';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from '../types/music';

export default async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused) {
      await TrackPlayer.pause();
    } else if (event.permanent) {
      await TrackPlayer.stop();
    } else {
      await TrackPlayer.play();
    }
  });

  // Keep useMusicStore in sync when track changes automatically or from lockscreen/notification
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
    if (event.track) {
      const trackId = event.track.id;
      const { tracks, currentTrack, setCurrentTrack } = useMusicStore.getState();
      const matched = tracks.find((t) => t.id === trackId);
      const newTrack: Track = matched || {
        id: event.track.id,
        url: (event.track.url as string) || '',
        title: event.track.title || 'Titre inconnu',
        artist: event.track.artist || 'Artiste inconnu',
        artwork: event.track.artwork as string,
        duration: event.track.duration,
        isLocal: true,
      };

      if (!currentTrack || currentTrack.id !== newTrack.id) {
        setCurrentTrack(newTrack);
        AsyncStorage.setItem(CURRENT_TRACK_STORAGE_KEY, JSON.stringify(newTrack)).catch(() => {});
        AsyncStorage.setItem(PLAYBACK_POSITION_STORAGE_KEY, '0').catch(() => {});
      }
    }
  });

  // A track that fails to load (file deleted/moved since it was scanned, a
  // remote demo track with no network, a corrupted file) previously just
  // stalled playback with no feedback at all. Skip to the next track
  // instead — one bad file shouldn't block the rest of the queue.
  TrackPlayer.addEventListener(Event.PlaybackError, async (error) => {
    console.warn('Moozy playback error, skipping to the next track:', error);
    try {
      await TrackPlayer.skipToNext();
    } catch (e) {
      // No next track to fall back to (e.g. a single-track queue) —
      // nothing more this handler can do.
    }
  });

  // Periodically (see progressUpdateEventInterval in audioService.ts)
  // persists how far into the current track playback has gotten, so a
  // killed-and-reopened app can resume close to where it left off instead
  // of always restarting from zero — see useMusicStore's initStore.
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
    AsyncStorage.setItem(
      PLAYBACK_POSITION_STORAGE_KEY,
      JSON.stringify(event.position)
    ).catch(() => {});
  });
}
