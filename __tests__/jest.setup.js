import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  reset: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  useTrackPlayerEvents: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  addEventListener: jest.fn(),
  registerPlaybackService: jest.fn(),
  Capability: {
    Play: 0,
    Pause: 1,
    Stop: 2,
    SkipToNext: 3,
    SkipToPrevious: 4,
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
  },
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Connecting: 'connecting',
  },
}));
