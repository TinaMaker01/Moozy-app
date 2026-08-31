import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode as TPRepeatMode,
  State,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioService, setupPlayer } from '../../src/services/audioService';
import { Track } from '../../src/types/music';

const mockTrack1: Track = {
  id: 'track-1',
  title: 'Track One',
  artist: 'Artist One',
  url: 'file:///music/track1.mp3',
  duration: 180,
  artwork: 'file:///art/1.jpg',
  isLocal: true,
};

const mockTrack2: Track = {
  id: 'track-2',
  title: 'Track Two',
  artist: 'Artist Two',
  url: 'file:///music/track2.mp3',
  duration: 240,
  isLocal: true,
};

describe('audioService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('setupPlayer', () => {
    it('initializes TrackPlayer with correct capabilities and options', async () => {
      const result = await setupPlayer();

      expect(result).toBe(true);
      expect(TrackPlayer.setupPlayer).toHaveBeenCalledWith({
        autoHandleInterruptions: true,
      });
      expect(TrackPlayer.updateOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          },
          capabilities: expect.arrayContaining([Capability.Play, Capability.Pause]),
        })
      );
    });

    it('returns true if player was already initialized', async () => {
      (TrackPlayer.setupPlayer as jest.Mock).mockRejectedValueOnce(
        new Error('The player has already been initialized')
      );

      const result = await setupPlayer();
      expect(result).toBe(true);
    });
  });

  describe('playTrack', () => {
    it('resets and adds queue when playing a new queue', async () => {
      (TrackPlayer.getQueue as jest.Mock).mockResolvedValueOnce([]);

      await AudioService.playTrack(mockTrack2, [mockTrack1, mockTrack2]);

      expect(TrackPlayer.reset).toHaveBeenCalled();
      expect(TrackPlayer.add).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'track-1' }),
        expect.objectContaining({ id: 'track-2' }),
      ]);
      expect(TrackPlayer.skip).toHaveBeenCalledWith(1);
      expect(TrackPlayer.play).toHaveBeenCalled();
    });

    it('skips directly without reset when the queue is already loaded', async () => {
      (TrackPlayer.getQueue as jest.Mock).mockResolvedValueOnce([
        { id: 'track-1' },
        { id: 'track-2' },
      ]);

      await AudioService.playTrack(mockTrack2, [mockTrack1, mockTrack2]);

      expect(TrackPlayer.reset).not.toHaveBeenCalled();
      expect(TrackPlayer.skip).toHaveBeenCalledWith(1);
      expect(TrackPlayer.play).toHaveBeenCalled();
    });
  });

  describe('loadForRestore', () => {
    it('loads queue and skips to position without calling play', async () => {
      await AudioService.loadForRestore(mockTrack1, [mockTrack1, mockTrack2], 45);

      expect(TrackPlayer.reset).toHaveBeenCalled();
      expect(TrackPlayer.add).toHaveBeenCalled();
      expect(TrackPlayer.skip).toHaveBeenCalledWith(0, 45);
      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });
  });

  describe('queue operations', () => {
    it('insertTrack adds track at specified index', async () => {
      await AudioService.insertTrack(mockTrack1, 2);
      expect(TrackPlayer.add).toHaveBeenCalledWith([expect.objectContaining({ id: 'track-1' })], 2);
    });

    it('addToQueue appends track to end', async () => {
      await AudioService.addToQueue(mockTrack2);
      expect(TrackPlayer.add).toHaveBeenCalledWith([expect.objectContaining({ id: 'track-2' })]);
    });

    it('removeAt removes track at index', async () => {
      await AudioService.removeAt(3);
      expect(TrackPlayer.remove).toHaveBeenCalledWith(3);
    });

    it('moveTrack moves track from one index to another', async () => {
      await AudioService.moveTrack(1, 4);
      expect(TrackPlayer.move).toHaveBeenCalledWith(1, 4);
    });

    it('setUpcomingQueue removes upcoming tracks and adds new ones', async () => {
      await AudioService.setUpcomingQueue([mockTrack1, mockTrack2]);
      expect(TrackPlayer.removeUpcomingTracks).toHaveBeenCalled();
      expect(TrackPlayer.add).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'track-1' }),
        expect.objectContaining({ id: 'track-2' }),
      ]);
    });
  });

  describe('playback control', () => {
    it('togglePlayPause pauses when playing', async () => {
      (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValueOnce({ state: State.Playing });
      (TrackPlayer.getProgress as jest.Mock).mockResolvedValueOnce({ position: 75 });

      await AudioService.togglePlayPause();

      expect(TrackPlayer.pause).toHaveBeenCalled();
      expect(await AsyncStorage.getItem('@moozy_playback_position_v1')).toBe('75');
    });

    it('togglePlayPause plays when paused', async () => {
      (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValueOnce({ state: State.Paused });

      await AudioService.togglePlayPause();

      expect(TrackPlayer.play).toHaveBeenCalled();
    });

    it('seekTo forwards position to TrackPlayer', async () => {
      await AudioService.seekTo(120);
      expect(TrackPlayer.seekTo).toHaveBeenCalledWith(120);
    });

    it('setRepeatMode maps application modes to TrackPlayer repeat modes', async () => {
      await AudioService.setRepeatMode('track');
      expect(TrackPlayer.setRepeatMode).toHaveBeenCalledWith(TPRepeatMode.Track);

      await AudioService.setRepeatMode('queue');
      expect(TrackPlayer.setRepeatMode).toHaveBeenCalledWith(TPRepeatMode.Queue);

      await AudioService.setRepeatMode('off');
      expect(TrackPlayer.setRepeatMode).toHaveBeenCalledWith(TPRepeatMode.Off);
    });

    it('skipToNext and skipToPrevious handle missing next/previous safely', async () => {
      (TrackPlayer.skipToNext as jest.Mock).mockRejectedValueOnce(new Error('No next track'));
      await expect(AudioService.skipToNext()).resolves.not.toThrow();

      (TrackPlayer.skipToPrevious as jest.Mock).mockRejectedValueOnce(new Error('No prev track'));
      await expect(AudioService.skipToPrevious()).resolves.not.toThrow();
    });
  });
});
