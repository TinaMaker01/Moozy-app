import React from 'react';

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn(),
    updateOptions: jest.fn(),
    add: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    skip: jest.fn(),
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
    getQueue: jest.fn().mockResolvedValue([]),
    registerPlaybackService: jest.fn(),
    addEventListener: jest.fn(),
  },
  useActiveTrack: jest.fn(),
  usePlaybackState: jest.fn(() => ({ state: 'none' })),
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
    Stop: 'stop',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'stop-playback-and-remove-notification',
  },
}));

jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
