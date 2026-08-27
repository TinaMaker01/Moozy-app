import { NavigatorScreenParams } from '@react-navigation/native';
import { Playlist } from './music';

export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Equalizer: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  Player: undefined;
  PlaylistDetail: { playlist: Playlist };
  ArtistDetail: { artistName: string };
};
