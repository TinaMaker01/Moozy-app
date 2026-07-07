import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  reset: jest.fn(),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  State: {
    None: 'none',
    Playing: 'playing',
    Paused: 'paused',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
