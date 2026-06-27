// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  skip: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  getQueue: jest.fn().mockResolvedValue([]),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
  Capability: {
    Play: 0,
    Pause: 1,
    SkipToNext: 2,
    SkipToPrevious: 3,
    Stop: 4,
  },
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Connecting: 'connecting',
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
}));
