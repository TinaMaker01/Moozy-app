// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue(true),
  play: jest.fn().mockResolvedValue(true),
  pause: jest.fn().mockResolvedValue(true),
  skip: jest.fn().mockResolvedValue(true),
  skipToNext: jest.fn().mockResolvedValue(true),
  skipToPrevious: jest.fn().mockResolvedValue(true),
  getQueue: jest.fn().mockResolvedValue([]),
  useActiveTrack: jest.fn().mockReturnValue(null),
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
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
    Stop: 'stop',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
}));
