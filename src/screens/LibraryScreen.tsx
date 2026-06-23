import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';
import MusicListItem from '../components/MusicListItem';

const MOCK_TRACKS = [
  { id: '1', title: 'Song One', artist: 'Artist A', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', title: 'Song Two', artist: 'Artist B', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
];

const LibraryScreen = () => {
  const handlePress = async (track: Track) => {
    await TrackPlayer.reset();
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
            onPress={() => handlePress(item)}
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
