import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import MusicListItem from '../components/MusicListItem';

const MOCK_TRACKS = [
  {
    id: '1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix',
  },
  {
    id: '2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'SoundHelix Song 2',
    artist: 'SoundHelix',
  },
];

const LibraryScreen = () => {
  const playTrack = async (track: any) => {
    await TrackPlayer.add(track);
    await TrackPlayer.play();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_TRACKS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MusicListItem
            title={item.title}
            artist={item.artist}
            onPress={() => playTrack(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default LibraryScreen;
