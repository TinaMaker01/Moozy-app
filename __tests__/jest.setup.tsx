import React from 'react';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  updateOptions: jest.fn().mockResolvedValue(undefined),
  add: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  skip: jest.fn().mockResolvedValue(undefined),
  getQueue: jest.fn().mockResolvedValue([]),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn(),
  useActiveTrack: jest.fn().mockReturnValue({ title: 'Mock Track', artist: 'Mock Artist' }),
  usePlaybackState: jest.fn().mockReturnValue({ state: 'playing' }),
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
    RemoteStop: 'remote-stop',
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'stop-playback-and-remove-notification',
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
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
