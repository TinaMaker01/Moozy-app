import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'None' })),
  State: {
    None: 'None',
    Playing: 'Playing',
    Paused: 'Paused',
  },
  Capability: {
    Play: 'Play',
    Pause: 'Pause',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
