import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
  },
  State: {
    None: 'none',
    Playing: 'playing',
    Paused: 'paused',
  },
}));


jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
