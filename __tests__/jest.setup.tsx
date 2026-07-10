import React from 'react';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  updateOptions: jest.fn().mockResolvedValue(undefined),
  add: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  skip: jest.fn().mockResolvedValue(undefined),
  skipToNext: jest.fn().mockResolvedValue(undefined),
  skipToPrevious: jest.fn().mockResolvedValue(undefined),
  getQueue: jest.fn().mockResolvedValue([]),
  useActiveTrack: jest.fn().mockReturnValue(null),
  usePlaybackState: jest.fn().mockReturnValue({ state: 'none' }),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
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

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
    TapGestureHandler: View,
    DrawerLayout: View,
    ScrollView: View,
    FlatList: View,
    TextInput: View,
    Switch: View,
    Direction: {},
  };
});
