import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode as TPRepeatMode,
  State,
  Track as TPTrack,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RepeatMode, Track } from '../types/music';
import { PLAYBACK_POSITION_STORAGE_KEY } from '../constants/storageKeys';
import { requestNotificationPermission } from './permissions';

let isPlayerSetup = false;

export async function setupPlayer(): Promise<boolean> {
  if (isPlayerSetup) {
    return true;
  }

  // Android 13+ treats POST_NOTIFICATIONS as denied until explicitly
  // requested at runtime, manifest declaration alone isn't enough — without
  // this, the playback notification (and the lockscreen controls tied to
  // it) silently never appears. Best-effort: playback still works even if
  // the user declines, just without a visible notification.
  await requestNotificationPermission();

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        // Swiping Moozy away from recents should behave like every other
        // background music app (Spotify, YouTube Music, Gramophone) and
        // this library's own default: keep playing, keep the notification
        // up. The previous StopPlaybackAndRemoveNotification setting
        // silently killed "background playback" on the single most common
        // gesture a user makes after starting a song and switching apps.
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      // Drives Event.PlaybackProgressUpdated (see playbackService.ts), which
      // persists the playback position periodically so a killed/reopened
      // app can resume roughly where it left off instead of from zero.
      progressUpdateEventInterval: 10,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
    });

    isPlayerSetup = true;
    return true;
  } catch (error: any) {
    // If player is already initialized, treat as setup
    if (error?.message?.includes('already been initialized')) {
      isPlayerSetup = true;
      return true;
    }
    console.warn('TrackPlayer setup error:', error);
    return false;
  }
}

/** Maps our app-level Track shape to the fields react-native-track-player expects. */
function toTrackPlayerFormat(track: Track): TPTrack {
  return {
    id: track.id,
    url: track.url,
    title: track.title,
    artist: track.artist,
    artwork: track.artwork,
    duration: track.duration,
    genre: track.genre,
  };
}

export const AudioService = {
  async playTrack(track: Track, queueList?: Track[]) {
    await setupPlayer();

    const targetQueue = queueList && queueList.length > 0 ? queueList : [track];
    const trackIndex = Math.max(
      targetQueue.findIndex((t) => t.id === track.id),
      0
    );

    // If the requested queue is already the one loaded in the native player
    // (e.g. tapping a different song from the list currently playing), just
    // jump to it instead of tearing down and rebuilding the whole queue —
    // that avoids an audible glitch and scales to large libraries where
    // resetting + re-adding thousands of tracks on every tap would be slow.
    let queueAlreadyLoaded = false;
    try {
      const existingQueue = await TrackPlayer.getQueue();
      queueAlreadyLoaded =
        existingQueue.length === targetQueue.length &&
        existingQueue.every((t, i) => t.id === targetQueue[i].id);
    } catch (e) {
      queueAlreadyLoaded = false;
    }

    if (queueAlreadyLoaded) {
      await TrackPlayer.skip(trackIndex);
      await TrackPlayer.play();
      return;
    }

    await TrackPlayer.reset();
    await TrackPlayer.add(targetQueue.map(toTrackPlayerFormat));
    await TrackPlayer.skip(trackIndex);
    await TrackPlayer.play();
  },

  /**
   * Reloads a previous session's queue and seeks to where it left off, but
   * stays paused — used once on app start to restore state, not to resume
   * playback the instant the app opens.
   */
  async loadForRestore(track: Track, queueList: Track[], positionSeconds: number) {
    await setupPlayer();

    const targetQueue = queueList.length > 0 ? queueList : [track];
    const trackIndex = Math.max(
      targetQueue.findIndex((t) => t.id === track.id),
      0
    );

    await TrackPlayer.reset();
    await TrackPlayer.add(targetQueue.map(toTrackPlayerFormat));
    await TrackPlayer.skip(trackIndex, positionSeconds);
  },

  /** Inserts a track into the native queue at a specific index without disturbing playback. */
  async insertTrack(track: Track, atIndex: number) {
    await TrackPlayer.add([toTrackPlayerFormat(track)], atIndex);
  },

  /** Appends a track to the end of the native queue. */
  async addToQueue(track: Track) {
    await TrackPlayer.add([toTrackPlayerFormat(track)]);
  },

  /** Removes the track at `index` from the native queue. */
  async removeAt(index: number) {
    await TrackPlayer.remove(index);
  },

  /** Moves a track within the native queue, mirroring a drag-to-reorder in the UI. */
  async moveTrack(fromIndex: number, toIndex: number) {
    await TrackPlayer.move(fromIndex, toIndex);
  },

  /** Replaces everything after the currently playing track with `tracks` (used by shuffle and "clear queue"). */
  async setUpcomingQueue(tracks: Track[]) {
    await TrackPlayer.removeUpcomingTracks();
    if (tracks.length > 0) {
      await TrackPlayer.add(tracks.map(toTrackPlayerFormat));
    }
  },

  async togglePlayPause() {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await this.pause();
    } else {
      await TrackPlayer.play();
    }
  },

  async play() {
    await TrackPlayer.play();
  },

  async pause() {
    await TrackPlayer.pause();
    // Also save immediately on an explicit pause, rather than relying only
    // on the ~10s progress tick — covers "pause then immediately kill the
    // app" without waiting for the next tick.
    try {
      const { position } = await TrackPlayer.getProgress();
      await AsyncStorage.setItem(PLAYBACK_POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch (e) {
      // Non-critical — the periodic tick will still catch up eventually.
    }
  },

  async skipToNext() {
    try {
      await TrackPlayer.skipToNext();
    } catch (e) {
      console.log('No next track in queue');
    }
  },

  async skipToPrevious() {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (e) {
      console.log('No previous track in queue');
    }
  },

  async seekTo(positionInSeconds: number) {
    await TrackPlayer.seekTo(positionInSeconds);
  },

  async setRepeatMode(mode: RepeatMode) {
    switch (mode) {
      case 'track':
        await TrackPlayer.setRepeatMode(TPRepeatMode.Track);
        break;
      case 'queue':
        await TrackPlayer.setRepeatMode(TPRepeatMode.Queue);
        break;
      case 'off':
      default:
        await TrackPlayer.setRepeatMode(TPRepeatMode.Off);
        break;
    }
  },
};
