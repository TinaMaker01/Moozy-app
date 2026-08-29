import TrackPlayer, { Event } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLAYBACK_POSITION_STORAGE_KEY } from '../constants/storageKeys';

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
