import { jest } from '@jest/globals';

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class NativeEventEmitter {
    addListener = jest.fn(() => ({ remove: jest.fn() }));
    removeListeners = jest.fn();
    removeAllListeners = jest.fn();
    emit = jest.fn();
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: 'View',
  };
});

// Mock react-native-track-player
const mockTrackPlayer = {
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  updateOptions: jest.fn().mockResolvedValue(undefined),
  add: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  skipToNext: jest.fn().mockResolvedValue(undefined),
  skipToPrevious: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
  useActiveTrack: jest.fn().mockReturnValue(undefined),
  usePlaybackState: jest.fn().mockReturnValue({ state: 'idle' }),
  State: {
    None: 'None',
    Ready: 'Ready',
    Playing: 'Playing',
    Paused: 'Paused',
    Stopped: 'Stopped',
    Buffering: 'Buffering',
    Loading: 'Loading',
  },
  Capability: {
    Play: 'Play',
    Pause: 'Pause',
    SkipToNext: 'SkipToNext',
    SkipToPrevious: 'SkipToPrevious',
    Stop: 'Stop',
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'StopPlaybackAndRemoveNotification',
    ContinuePlayback: 'ContinuePlayback',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    PlaybackState: 'playback-state',
  },
};

jest.mock('react-native-track-player', () => mockTrackPlayer);
export default mockTrackPlayer;
