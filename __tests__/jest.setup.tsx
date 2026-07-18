import React from 'react';
import { View } from 'react-native';

export const MockComponent = () => <View />;

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: 'View',
    Swipeable: 'View',
    DrawerLayout: 'View',
    State: {},
    PanGestureHandler: 'View',
    BaseButton: 'View',
    RectButton: 'View',
    BorderlessButton: 'View',
  };
});

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class NativeEventEmitter {
    addListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    removeListeners = jest.fn();
    removeAllListeners = jest.fn();
    emit = jest.fn();
  };
});

// Mock react-native-track-player
jest.mock('react-native-track-player', () => {
  return {
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
      reset: jest.fn().mockResolvedValue(undefined),
      registerPlaybackService: jest.fn(),
      addEventListener: jest.fn(),
    },
    useActiveTrack: jest.fn().mockReturnValue(null),
    usePlaybackState: jest.fn().mockReturnValue({ state: 'None' }),
    State: {
      None: 'None',
      Ready: 'Ready',
      Playing: 'Playing',
      Paused: 'Paused',
      Stopped: 'Stopped',
      Buffering: 'Buffering',
      Loading: 'Loading',
    },
    Capability: {
      Play: 'Play',
      Pause: 'Pause',
      SkipToNext: 'SkipToNext',
      SkipToPrevious: 'SkipToPrevious',
      Stop: 'Stop',
    },
    AppKilledPlaybackBehavior: {
      StopPlaybackAndRemoveNotification: 'StopPlaybackAndRemoveNotification',
      ContinuePlayback: 'ContinuePlayback',
    },
    Event: {
      RemotePlay: 'RemotePlay',
      RemotePause: 'RemotePause',
      RemoteNext: 'RemoteNext',
      RemotePrevious: 'RemotePrevious',
    },
  };
});
