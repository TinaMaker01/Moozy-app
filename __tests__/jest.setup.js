// Mock TrackPlayer
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
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
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
}));

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class MockEventEmitter {
    addListener = jest.fn();
    removeListeners = jest.fn();
    removeAllListeners = jest.fn();
    emit = jest.fn();
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: jest.fn(),
  DrawerLayout: jest.fn(),
  State: {},
  ScrollView: jest.fn(),
  Slider: jest.fn(),
  Switch: jest.fn(),
  TextInput: jest.fn(),
  ToolbarAndroid: jest.fn(),
  ViewPagerAndroid: jest.fn(),
  DrawerLayoutAndroid: jest.fn(),
  WebView: jest.fn(),
  NativeViewGestureHandler: jest.fn(),
  TapGestureHandler: jest.fn(),
  FlingGestureHandler: jest.fn(),
  ForceTouchGestureHandler: jest.fn(),
  LongPressGestureHandler: jest.fn(),
  PanGestureHandler: jest.fn(),
  PinchGestureHandler: jest.fn(),
  RotationGestureHandler: jest.fn(),
  RawButton: jest.fn(),
  BaseButton: jest.fn(),
  RectButton: jest.fn(),
  BorderlessButton: jest.fn(),
  FlatList: jest.fn(),
  gestureHandlerRootHOC: jest.fn(),
  Directions: {},
}));
