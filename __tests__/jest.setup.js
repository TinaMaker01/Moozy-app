import 'react-native-gesture-handler/jestSetup';

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
  usePlaybackState: jest.fn(() => ({ state: 'paused' })),
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    Next: 'next',
    Previous: 'previous',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
