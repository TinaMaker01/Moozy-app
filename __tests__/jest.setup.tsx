import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  skip: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  getQueue: jest.fn().mockResolvedValue([]),
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'None' })),
  Event: {
    PlaybackState: 'playback-state',
    PlaybackTrackChanged: 'playback-track-changed',
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
  State: {
    None: 'None',
    Playing: 'Playing',
    Paused: 'Paused',
    Buffering: 'Buffering',
    Loading: 'Loading',
    Stopped: 'Stopped',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      removeAllListeners: jest.fn(),
      emit: jest.fn(),
    })),
  };
});
