import TrackPlayer, { Event } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import playbackService from '../../src/services/playbackService';

describe('playbackService', () => {
  const eventListeners: Record<string, (event?: any) => Promise<void> | void> = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();

    (TrackPlayer.addEventListener as jest.Mock).mockImplementation((event, callback) => {
      eventListeners[event] = callback;
      return { remove: jest.fn() };
    });
  });

  it('registers all required remote and playback event listeners', async () => {
    await playbackService();

    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemotePlay, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemotePause, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemoteNext, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemotePrevious, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemoteSeek, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemoteStop, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.RemoteDuck, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(Event.PlaybackError, expect.any(Function));
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.PlaybackProgressUpdated,
      expect.any(Function)
    );
  });

  it('handles remote playback transport controls', async () => {
    await playbackService();

    eventListeners[Event.RemotePlay]();
    expect(TrackPlayer.play).toHaveBeenCalled();

    eventListeners[Event.RemotePause]();
    expect(TrackPlayer.pause).toHaveBeenCalled();

    eventListeners[Event.RemoteNext]();
    expect(TrackPlayer.skipToNext).toHaveBeenCalled();

    eventListeners[Event.RemotePrevious]();
    expect(TrackPlayer.skipToPrevious).toHaveBeenCalled();

    eventListeners[Event.RemoteSeek]({ position: 45 });
    expect(TrackPlayer.seekTo).toHaveBeenCalledWith(45);

    eventListeners[Event.RemoteStop]();
    expect(TrackPlayer.reset).toHaveBeenCalled();
  });

  it('handles RemoteDuck audio focus changes', async () => {
    await playbackService();

    // Paused duck (e.g. phone call in progress)
    await eventListeners[Event.RemoteDuck]({ paused: true, permanent: false });
    expect(TrackPlayer.pause).toHaveBeenCalled();

    // Permanent duck (e.g. another media app took exclusive focus)
    await eventListeners[Event.RemoteDuck]({ paused: false, permanent: true });
    expect(TrackPlayer.stop).toHaveBeenCalled();

    // Resumed duck (e.g. notification tone finished)
    await eventListeners[Event.RemoteDuck]({ paused: false, permanent: false });
    expect(TrackPlayer.play).toHaveBeenCalled();
  });

  it('handles PlaybackError by skipping to next track', async () => {
    await playbackService();

    await eventListeners[Event.PlaybackError]({ message: 'Corrupt file' });
    expect(TrackPlayer.skipToNext).toHaveBeenCalled();
  });

  it('persists position on PlaybackProgressUpdated', async () => {
    await playbackService();

    eventListeners[Event.PlaybackProgressUpdated]({ position: 104.5 });

    // Allow any pending promises in setItem to resolve
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(await AsyncStorage.getItem('@moozy_playback_position_v1')).toBe('104.5');
  });
});
