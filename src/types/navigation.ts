import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  Player: undefined;
  // Screens are looked up live from the store by id/name rather than
  // receiving a snapshot object as a param, so they stay in sync with any
  // change made elsewhere (rename, track added/removed) after navigating.
  PlaylistDetail: { playlistId: string };
  ArtistDetail: { artistName: string };
  Equalizer: undefined;
};
