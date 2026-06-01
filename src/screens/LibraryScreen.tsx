import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import MusicListItem from '../components/MusicListItem';

const MOCK_TRACKS = [
  { id: '1', title: 'Song One', artist: 'Artist A' },
  { id: '2', title: 'Song Two', artist: 'Artist B' },
];

const LibraryScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_TRACKS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MusicListItem
            title={item.title}
            artist={item.artist}
            onPress={() => console.log('Playing', item.title)}
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
