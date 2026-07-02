jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue(true),
  play: jest.fn().mockResolvedValue(true),
  pause: jest.fn().mockResolvedValue(true),
  skipToNext: jest.fn().mockResolvedValue(true),
  skipToPrevious: jest.fn().mockResolvedValue(true),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
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
    RemoteStop: 'remote-stop',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'playing' })),
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
}));
