import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  skip: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  getQueue: jest.fn(() => Promise.resolve([])),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  registerPlaybackService: jest.fn(),
  Capability: {
    Play: 0,
    Pause: 1,
    SkipToNext: 2,
    SkipToPrevious: 3,
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
  State: {
    None: 'none',
    Playing: 'playing',
    Paused: 'paused',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
