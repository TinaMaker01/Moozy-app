jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  reset: jest.fn(),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  Capability: {
    Play: 'play',
    Pause: 'pause',
  },
  State: {
    None: 'none',
    Playing: 'playing',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest.fn(({ children }) => children),
}));
