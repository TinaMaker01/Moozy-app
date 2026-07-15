import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  skip: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  getQueue: jest.fn(),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'None' })),
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
  Capability: {
    Play: 0,
    Pause: 1,
    SkipToNext: 2,
    SkipToPrevious: 3,
    Stop: 4,
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'stop-playback-and-remove-notification',
  },
  State: {
    None: 'None',
    Playing: 'Playing',
    Paused: 'Paused',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
