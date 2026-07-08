import 'react-native';
import React from 'react';

// Mock NativeEventEmitter
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

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn().mockResolvedValue(undefined),
    updateOptions: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    skip: jest.fn().mockResolvedValue(undefined),
    skipToNext: jest.fn().mockResolvedValue(undefined),
    skipToPrevious: jest.fn().mockResolvedValue(undefined),
    getQueue: jest.fn().mockResolvedValue([]),
    registerPlaybackService: jest.fn(),
    addEventListener: jest.fn(),
  },
  useActiveTrack: jest.fn().mockReturnValue(null),
  usePlaybackState: jest.fn().mockReturnValue({ state: 'none' }),
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
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
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  State: {},
  PanGestureHandler: 'PanGestureHandler',
  BaseButton: 'BaseButton',
  RectButton: 'RectButton',
  TouchableOpacity: 'TouchableOpacity',
  DrawerLayout: 'DrawerLayout',
}));
