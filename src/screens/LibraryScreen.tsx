import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import MusicListItem from '../components/MusicListItem';

const MOCK_TRACKS = [
  {
    id: '1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Song One',
    artist: 'Artist A',
  },
  {
    id: '2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Song Two',
    artist: 'Artist B',
  },
];

const LibraryScreen = () => {
  const handlePress = async (index: number) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(MOCK_TRACKS);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_TRACKS}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <MusicListItem
            title={item.title}
            artist={item.artist}
            onPress={() => handlePress(index)}
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
