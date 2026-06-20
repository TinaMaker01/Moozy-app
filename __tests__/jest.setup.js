import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue(true),
  play: jest.fn().mockResolvedValue(true),
  pause: jest.fn().mockResolvedValue(true),
  stop: jest.fn().mockResolvedValue(true),
  reset: jest.fn().mockResolvedValue(true),
  Capability: {
    Play: 0,
    Pause: 1,
    Stop: 2,
    Next: 3,
    Previous: 4,
  },
}));
