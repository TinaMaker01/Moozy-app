// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(null),
  updateOptions: jest.fn().mockResolvedValue(null),
  add: jest.fn().mockResolvedValue(null),
  play: jest.fn().mockResolvedValue(null),
  pause: jest.fn().mockResolvedValue(null),
  skip: jest.fn().mockResolvedValue(null),
  skipToNext: jest.fn().mockResolvedValue(null),
  skipToPrevious: jest.fn().mockResolvedValue(null),
  getQueue: jest.fn().mockResolvedValue([]),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn().mockReturnValue({ state: 'none' }),
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    Swipeable: jest.fn(),
    DrawerLayout: jest.fn(),
    State: {},
    PanGestureHandler: jest.fn(),
    BaseButton: jest.fn(),
    RectButton: jest.fn(),
    BorderlessButton: jest.fn(),
    RawButton: jest.fn(),
    GestureHandlerRootView: jest.fn(({ children }) => children),
  };
});
