import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode as TPRepeatMode,
  State,
} from 'react-native-track-player';
import { RepeatMode, Track } from '../types/music';

let isPlayerSetup = false;

export async function setupPlayer(): Promise<boolean> {
  if (isPlayerSetup) {
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
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

export const AudioService = {
  async playTrack(track: Track, queueList?: Track[]) {
    await setupPlayer();

    // Prepare track for TrackPlayer format
    const formattedTrack = {
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
      genre: track.genre,
    };

    if (queueList && queueList.length > 0) {
      await TrackPlayer.reset();
      const formattedQueue = queueList.map((t) => ({
        id: t.id,
        url: t.url,
        title: t.title,
        artist: t.artist,
        artwork: t.artwork,
        duration: t.duration,
        genre: t.genre,
      }));
      await TrackPlayer.add(formattedQueue);

      const trackIndex = queueList.findIndex((t) => t.id === track.id);
      if (trackIndex >= 0) {
        await TrackPlayer.skip(trackIndex);
      }
    } else {
      await TrackPlayer.reset();
      await TrackPlayer.add([formattedTrack]);
    }

    await TrackPlayer.play();
  },

  async togglePlayPause() {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  },

  async play() {
    await TrackPlayer.play();
  },

  async pause() {
    await TrackPlayer.pause();
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
