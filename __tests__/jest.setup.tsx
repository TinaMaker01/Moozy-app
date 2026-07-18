import 'react-native-gesture-handler/jestSetup';

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class MockNativeEventEmitter {
    addListener = jest.fn(() => ({ remove: jest.fn() }));
    removeListeners = jest.fn();
    removeAllListeners = jest.fn();
    emit = jest.fn();
  };
});

// Mock react-native-track-player
jest.mock('react-native-track-player', () => {
  return {
    __esModule: true,
    default: {
      setupPlayer: jest.fn().mockResolvedValue(null),
      registerPlaybackService: jest.fn(),
      add: jest.fn().mockResolvedValue(null),
      play: jest.fn().mockResolvedValue(null),
      pause: jest.fn().mockResolvedValue(null),
      stop: jest.fn().mockResolvedValue(null),
      reset: jest.fn().mockResolvedValue(null),
      skipToNext: jest.fn().mockResolvedValue(null),
      skipToPrevious: jest.fn().mockResolvedValue(null),
      updateOptions: jest.fn().mockResolvedValue(null),
    },
    useActiveTrack: jest.fn().mockReturnValue(null),
    usePlaybackState: jest.fn().mockReturnValue({ state: 'idle' }),
    useProgress: jest.fn().mockReturnValue({ position: 0, duration: 0, buffered: 0 }),
    Capability: {
      Play: 'play',
      Pause: 'pause',
      Stop: 'stop',
      SkipToNext: 'skipToNext',
      SkipToPrevious: 'skipToPrevious',
    },
    Event: {
      RemotePlay: 'remote-play',
      RemotePause: 'remote-pause',
      RemoteNext: 'remote-next',
      RemotePrevious: 'remote-previous',
    },
    State: {
      None: 'none',
      Ready: 'ready',
      Playing: 'playing',
      Paused: 'paused',
      Stopped: 'stopped',
      Buffering: 'buffering',
    },
    AppKilledPlaybackBehavior: {
      StopPlaybackAndRemoveNotification: 'StopPlaybackAndRemoveNotification',
    },
  };
});
