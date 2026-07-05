import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import MusicListItem from '../components/MusicListItem';

const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Song One',
    artist: 'Artist A',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Song Two',
    artist: 'Artist B',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
];

const LibraryScreen = () => {
  const handlePlayTrack = async (track: (typeof MOCK_TRACKS)[0]) => {
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        await TrackPlayer.add(MOCK_TRACKS);
      }
      const trackIndex = MOCK_TRACKS.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        await TrackPlayer.skip(trackIndex);
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
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
            onPress={() => handlePlayTrack(item)}
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
